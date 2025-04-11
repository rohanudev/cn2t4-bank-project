import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  # 네 프로젝트 설정에 맞게
django.setup()

import pytest
from dotenv import load_dotenv
load_dotenv()

from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from users.models import User


@pytest.fixture
def authenticated_client(db):
    with patch("authentication.auth.jwk_client") as mock_jwk, \
         patch("authentication.auth.jwt.decode") as mock_decode:
        
        mock_key = MagicMock()
        mock_key.key = "FAKE"
        mock_jwk.get_signing_key_from_jwt.return_value = mock_key
        mock_decode.return_value = {"sub": "6a0fa1e8-9d4e-4e63-a2be-486ad6d1f96a"}

        user = User.objects.create(user_id="6a0fa1e8-9d4e-4e63-a2be-486ad6d1f96a", email="a@b.com")
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Bearer fake")
        yield client, user