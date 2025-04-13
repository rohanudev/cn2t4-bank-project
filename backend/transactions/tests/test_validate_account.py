import pytest
from accounts.models import Account
import json

# 성공 케이스
@pytest.mark.django_db
def test_validate_account_success(authenticated_client):
    client, user = authenticated_client
    account = Account.objects.create(user=user, account_number='1234567890', nickname='내 통장', balance=10000)

    # 요청 본문 구성
    payload = {
        "account_number": account.account_number
    }

    response = client.post("/api/transactions/validate_account", data=payload, content_type="application/json")

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["account"]["account_number"] == account.account_number
    assert data["account"]["owner"] == user.name
    assert data["account"]["balance"] == account.balance

# 실패 케이스들
# 계좌번호가 존재하지 않는 경우
@pytest.mark.django_db
def test_validate_account_not_found(authenticated_client):
    client, user = authenticated_client
    payload = {
        "account_number": "nonexistent"
    }

    response = client.post("/api/transactions/validate_account", data=payload, content_type="application/json")

    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "not found" in data["message"]

# 계좌가 비활성화된 경우
@pytest.mark.django_db
def test_validate_account_closed_status(authenticated_client):
    client, user = authenticated_client
    account = Account.objects.create(user=user, account_number='222333444', status='CLOSED', nickname='닫힌 계좌', balance=0)

    payload = {
        "account_number": account.account_number
    }

    response = client.post("/api/transactions/validate_account", data=payload, content_type="application/json")

    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "비활성" in data["message"]

# 계좌번호가 잘못된 형식인 경우
@pytest.mark.django_db
def test_validate_account_missing_field(authenticated_client):
    client, user = authenticated_client
    payload = {}  # 아무것도 안 보냄

    response = client.post("/api/transactions/validate_account", data=payload, content_type="application/json")

    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Missing account number" in data["message"]