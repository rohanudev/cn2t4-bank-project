import pytest
from accounts.models import Account
import json

# 성공 케이스들
@pytest.mark.django_db
def test_transaction_deposit_success(authenticated_client):
    client, user = authenticated_client
    account = Account.objects.create(user=user, account_number="111122223333", nickname="입금계좌", balance=50000)

    res = client.post("/api/transactions/deposit", json.dumps({
        "account_number": account.account_number,
        "amount": 10000,
        "memo": "테스트 입금"
    }), content_type="application/json")

    assert res.status_code == 200
    data = res.json()["transaction"]
    assert data["amount"] == 10000
    assert data["balance_after"] == 60000
    assert data["type"] == "deposit"
    assert data["status"] == "SUCCESS"


@pytest.mark.django_db
def test_transaction_withdraw_success(authenticated_client):
    client, user = authenticated_client
    account = Account.objects.create(user=user, account_number="444455556666", nickname="출금계좌", balance=30000)

    res = client.post("/api/transactions/withdraw", json.dumps({
        "account_number": account.account_number,
        "amount": 10000,
        "memo": "테스트 출금"
    }), content_type="application/json")

    assert res.status_code == 200
    data = res.json()["transaction"]
    assert data["amount"] == 10000
    assert data["balance_after"] == 20000
    assert data["type"] == "withdrawal"
    assert data["status"] == "SUCCESS"


@pytest.mark.django_db
def test_transaction_transfer_success(authenticated_client):
    client, user = authenticated_client
    
    from_account = Account.objects.create(user=user, account_number="777788889999", nickname="보내는계좌", balance=50000)
    to_account = Account.objects.create(user=user, account_number="888899990000", nickname="받는계좌", balance=20000)

    res = client.post("/api/transactions/transfer", json.dumps({
        "from_account": from_account.account_number,
        "to_account": to_account.account_number,
        "amount": 15000,
        "memo": "테스트 이체"
    }), content_type="application/json")

    assert res.status_code == 200
    data = res.json()["transaction"]
    assert data["amount"] == 15000
    assert data["balance_after"] == 35000
    assert data["type"] == "transfer"
    assert data["status"] == "SUCCESS"


# 실패 케이스들
# 금액 부족
@pytest.mark.django_db
def test_transaction_insufficient_balance(authenticated_client):
    client, user = authenticated_client
    account = Account.objects.create(user=user, account_number="1234567890", nickname="테스트계좌", balance=100000)
    
    res = client.post("/api/transactions/withdraw", json.dumps({
        "account_number": account.account_number,
        "amount": 999999,
        "memo": "과도한 인출"
    }), content_type="application/json")
    assert res.status_code == 400
    assert "[ERROR] Insufficient balance" in res.content.decode()

# 계좌 없음
@pytest.mark.django_db
def test_transaction_account_not_found(authenticated_client):
    client, user = authenticated_client

    res = client.post("/api/transactions/deposit", json.dumps({
    "account_number": "0000000000",
    "amount": 1000,
    "memo": "잘못된 계좌"
    }), content_type="application/json")
    assert res.status_code == 404
    assert "[ERROR] Account not found" in res.content.decode()

# 동일한 계좌로 송금
@pytest.mark.django_db
def test_transaction_cannot_transfer_to_self(authenticated_client):
    client, user = authenticated_client
    account = Account.objects.create(user=user, account_number="1234567890", nickname="테스트계좌", balance=100000)
    
    res = client.post("/api/transactions/transfer", json.dumps({
        "from_account": account.account_number,
        "to_account": account.account_number,
        "amount": 1000,
        "memo": "자기 이체"
    }), content_type="application/json")
    assert res.status_code == 400
    assert "[ERROR] Cannot transfer to the same account" in res.content.decode()