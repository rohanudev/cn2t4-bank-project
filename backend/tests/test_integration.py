import django
django.setup()

import pytest
from django.urls import reverse
from accounts.models import Account
from transactions.models import Transaction
import boto3
import os
from rest_framework.test import APIClient
from users.models import User
import logging
logger = logging.getLogger(__name__)

@pytest.mark.django_db(transaction=True)
def test_login_api_and_full_transaction_flow(create_local_test_user):
    username = os.getenv("TEST_USERNAME")
    password = os.getenv("TEST_PASSWORD")

    # 1. 실제 로그인 API 호출
    client = APIClient()
    logger.info("[1단계] 로그인 요청 시작")
    res = client.post("/api/authentication/login", {
        "email": username,
        "password": password
    }, format="json")
    assert res.status_code == 200
    logger.info("→ 로그인 성공: access_token 획득")

    tokens = res.json()
    access_token = tokens["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    logger.info("[2단계] 계좌 생성")
    user = User.objects.get(email=username)
    account1 = Account.objects.create(user=user, account_number="3010000000", nickname="통합계좌", balance=0)
    account2 = Account.objects.create(user=user, account_number="3020000000", nickname="보조계좌", balance=0)
    logger.info(f"→ 계좌1: {account1.account_number}(0원), 계좌2: {account2.account_number}(0원)")

    logger.info("[3단계] 입금 테스트")
    res = client.post("/api/transactions/deposit", {
        "account_number": account1.account_number,
        "amount": 50000,
        "memo": "초기 입금"
    }, format="json")
    assert res.status_code == 200
    logger.info("→ 입금 성공 (계좌1): +50000원")

    logger.info("[4단계] 출금 테스트")
    res = client.post("/api/transactions/withdraw", {
        "account_number": account1.account_number,
        "amount": 10000,
        "memo": "출금 테스트"
    }, format="json")
    assert res.status_code == 200
    logger.info("→ 출금 성공 (계좌1): -10000원")

    logger.info("[5단계] 이체 테스트")
    res = client.post("/api/transactions/transfer", {
        "from_account": account1.account_number,
        "to_account": account2.account_number,
        "amount": 15000,
        "memo": "이체 테스트"
    }, format="json")
    assert res.status_code == 200
    logger.info("→ 이체 성공: -15000원 (from 계좌1 → 계좌2)")

    logger.info("[6단계] 거래내역 조회")
    res = client.get(f"/api/accounts/{account1.account_number}/history")
    assert res.status_code == 200
    history = res.json()["history"]
    logger.info(f"→ 거래내역 개수: {len(history)}")
    assert len(history) == 3

    logger.info("[🎯 최종 요약]")
    logger.info(f"사용자: {user.email}")
    logger.info(f"계좌1 ({account1.account_number}) 잔액: {Account.objects.get(pk=account1.pk).balance}")
    logger.info(f"계좌2 ({account2.account_number}) 잔액: {Account.objects.get(pk=account2.pk).balance}")
    logger.info("✅ 테스트 성공")