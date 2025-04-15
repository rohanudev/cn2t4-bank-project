import boto3
import pytest
import os
from users.models import User
from django.db.utils import IntegrityError
import logging
logger = logging.getLogger(__name__)


@pytest.fixture(scope="session", autouse=True)
def setup_test_user_once():
    client = boto3.client("cognito-idp",
                          region_name=os.getenv("AWS_REGION"),
                          aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                          aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                        )
    user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
    email = os.getenv("TEST_USERNAME")
    password = os.getenv("TEST_PASSWORD")

    try:
        # 1. Cognito에서 테스트 유저 생성
        client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
            ],
            MessageAction="SUPPRESS"
        )
        logger.info("[INFO] 테스트 유저 생성 완료")

        # 2. Cognito에서 비밀번호 영구 설정
        client.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=email,
            Password=password,
            Permanent=True
        )
        logger.info("[INFO] 비밀번호 영구 설정 완료")

    except client.exceptions.UsernameExistsException:
        logger.info("[INFO] 테스트 유저가 이미 존재합니다.")
    except Exception as e:
        print("[ERROR] 테스트 유저 생성 실패:", str(e))

    # 3. Cognito에서 유저 정보 가져오기 (항상 시도)
    try:
        user_info = client.admin_get_user(
            UserPoolId=user_pool_id,
            Username=email
        )
        sub_attr = next((attr['Value'] for attr in user_info['UserAttributes'] if attr['Name'] == 'sub'), None)
        
        return sub_attr, email
    except Exception as e:
        print("[ERROR] 유저 정보 가져오기 실패:", str(e))
        return None, None

@pytest.fixture
def create_local_test_user(setup_test_user_once):
    sub_attr, email = setup_test_user_once

    try:
        User.objects.create(
            user_id=sub_attr,
            email=email,
            name="Test User",
            phone="+821011112222"
        )
        
        logger.info("[INFO] 로컬 테스트 DB 사용자 생성 완료")
    except IntegrityError:
        print("[INFO] 로컬 테스트 DB 사용자 이미 존재")
