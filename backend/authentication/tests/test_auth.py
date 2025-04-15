import json
import pytest
from unittest.mock import patch
from django.test import Client
from users.models import User

@pytest.mark.django_db
class TestAuth:

    @patch('authentication.views.client')
    @patch('authentication.views.jwt.decode')
    def test_login_success(self, mock_jwt_decode, mock_boto_client):
        client = Client()
        user_sub = '1234-user-sub'

        # 1. Mock boto3 응답
        mock_boto_client.initiate_auth.return_value = {
            'AuthenticationResult': {
                'IdToken': 'mock.id.token',
                'AccessToken': 'mock.access.token',
                'RefreshToken': 'mock.refresh.token'
            }
        }

        # 2. JWT decode mock
        mock_jwt_decode.return_value = {'sub': user_sub}

        # 3. 로컬 DB에 유저 생성
        user = User.objects.create(
            user_id=user_sub,
            email='test@example.com',
            name='Tester',
            phone='01012345678',
            status='active'
        )

        payload = {
            'email': 'test@example.com',
            'password': 'testpassword'
        }

        response = client.post('/login', data=json.dumps(payload), content_type='application/json')

        assert response.status_code == 200
        assert response.json()['message'] == '로그인 성공'
        assert response.json()['user']['email'] == user.email

    @patch('authentication.views.client')
    @patch('authentication.views.jwt.decode')
    def test_login_user_not_found(self, mock_jwt_decode, mock_boto_client):
        client = Client()
        mock_boto_client.initiate_auth.return_value = {
            'AuthenticationResult': {
                'IdToken': 'mock.id.token',
                'AccessToken': 'mock.access.token',
                'RefreshToken': 'mock.refresh.token'
            }
        }
        mock_jwt_decode.return_value = {'sub': 'non-existent-user'}

        payload = {
            'email': 'noone@example.com',
            'password': 'wrongpassword'
        }

        response = client.post('/login', data=json.dumps(payload), content_type='application/json')

        assert response.status_code == 404
        assert 'error' in response.json()

    @patch('authentication.views.client')
    def test_refresh_token_success(self, mock_boto_client):
        client = Client()
        mock_boto_client.initiate_auth.return_value = {
            'AuthenticationResult': {
                'AccessToken': 'new.access.token',
                'IdToken': 'new.id.token',
            }
        }

        payload = {
            'refresh_token': 'valid-refresh-token'
        }

        response = client.post('/refresh-token', data=json.dumps(payload), content_type='application/json')

        assert response.status_code == 200
        assert 'access_token' in response.json()

    @patch('authentication.views.client')
    def test_logout_success(self, mock_boto_client):
        client = Client()
        payload = {
            'refresh_token': 'some-refresh-token'
        }

        response = client.post(
            '/logout',
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_AUTHORIZATION='Bearer mock-access-token'
        )

        assert response.status_code == 200
        assert response.json()['message'] == '로그아웃 완료'