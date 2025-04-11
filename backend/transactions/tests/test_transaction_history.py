import pytest
from django.urls import reverse
from transactions.models import Transaction
from accounts.models import Account
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_transaction_history_success(client):
    user = get_user_model().objects.create_user(username="testuser", email="test@example.com", password="password123")
    account = Account.objects.create(user=user, account_number="1234567890", nickname="테스트계좌", balance=100000)

    # 생성된 계좌에 입금 트랜잭션 두 개
    Transaction.objects.create(
        type="DEPOSIT",
        status="SUCCESS",
        to_account=account,
        amount=50000,
        balance_after=150000,
        memo="입금1"
    )
    Transaction.objects.create(
        type="DEPOSIT",
        status="SUCCESS",
        to_account=account,
        amount=10000,
        balance_after=160000,
        memo="입금2"
    )

    # 인증된 요청 (jwt_required가 있으므로 인증 처리 필요 시 mock 필요)
    client = APIClient()
    client.force_authenticate(user=user)

    url = f"/api/accounts/{account.account_number}/history"
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["history"]) == 2
    assert data["history"][0]["amount"] == 10000
    assert data["history"][1]["amount"] == 50000

@pytest.mark.django_db
def test_transaction_history_account_not_found(client):
    url = "/api/accounts/0000000000/history"
    response = client.get(url)
    assert response.status_code == 404
    assert "[ERROR] Account not found" in response.content.decode()