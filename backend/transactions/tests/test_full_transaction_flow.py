import pytest
import json
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from accounts.models import Account

@pytest.mark.django_db
def test_full_transaction_flow():
    User = get_user_model()
    user = User.objects.create_user(username="flowuser", email="flow@example.com", password="flowpass")
    recipient = User.objects.create_user(username="receiver", email="recv@example.com", password="recvpass")

    account = Account.objects.create(user=user, account_number="1000000001", nickname="나의계좌", balance=0)
    to_account = Account.objects.create(user=recipient, account_number="2000000002", nickname="상대계좌", balance=0)

    client = APIClient()
    client.force_authenticate(user=user)

    # 1. Validate account
    res = client.post("/api/transactions/validate_account", json.dumps({"account_number": account.account_number}), content_type="application/json")
    assert res.status_code == 200
    assert res.json()["account"]["owner"] == user.name

    # 2. Deposit
    res = client.post("/api/transactions/deposit", json.dumps({
        "account_number": account.account_number,
        "amount": 100000,
        "memo": "초기 입금"
    }), content_type="application/json")
    assert res.status_code == 200
    assert res.json()["transaction"]["balance_after"] == 100000

    # 3. Withdraw
    res = client.post("/api/transactions/withdraw", json.dumps({
        "account_number": account.account_number,
        "amount": 30000,
        "memo": "현금 인출"
    }), content_type="application/json")
    assert res.status_code == 200
    assert res.json()["transaction"]["balance_after"] == 70000

    # 4. Transfer
    res = client.post("/api/transactions/transfer", json.dumps({
        "from_account": account.account_number,
        "to_account": to_account.account_number,
        "amount": 20000,
        "memo": "용돈 보냄"
    }), content_type="application/json")
    assert res.status_code == 200
    assert res.json()["transaction"]["balance_after"] == 50000

    # 5. Transaction History
    res = client.get(f"/api/accounts/{account.account_number}/history")
    assert res.status_code == 200
    history = res.json()["history"]
    assert len(history) == 3  # 입금, 출금, 이체
    types = [tx["type"] for tx in history]
    assert set(types) == {"DEPOSIT", "WITHDRAWAL", "TRANSFER"}