import pytest
from django.urls import reverse
from accounts.models import Account
from transactions.models import Transaction
import uuid
import json

@pytest.mark.django_db
def test_transaction_history_success(authenticated_client):
    client, user = authenticated_client

    # 계좌 2개 생성 (입출금/이체 구분용)
    account1 = Account.objects.create(user=user, account_number='1000000000', nickname='주계좌', balance=100000)
    account2 = Account.objects.create(user=user, account_number='2000000000', nickname='서브계좌', balance=50000)

    # 입금
    Transaction.objects.create(
        type='DEPOSIT',
        status='SUCCESS',
        to_account=account1,
        amount=10000,
        balance_after=110000,
        memo='입금 테스트'
    )

    # 출금
    Transaction.objects.create(
        type='WITHDRAWAL',
        status='SUCCESS',
        from_account=account1,
        amount=20000,
        balance_after=90000,
        memo='출금 테스트'
    )

    # 이체
    Transaction.objects.create(
        type='TRANSFER',
        status='SUCCESS',
        from_account=account1,
        to_account=account2,
        amount=15000,
        balance_after=75000,
        memo='이체 테스트'
    )

    res = client.get(f'/api/accounts/{account1.account_number}/history')

    assert res.status_code == 200
    data = res.json()

    assert data['success'] is True
    assert len(data['history']) == 3

    # 항목별 내용 검증 (최신순)
    tx1 = data['history'][0]
    assert tx1['type'] == 'TRANSFER'
    assert tx1['from_account'] == account1.account_number
    assert tx1['to_account'] == account2.account_number
    assert tx1['memo'] == '이체 테스트'

    tx2 = data['history'][1]
    assert tx2['type'] == 'WITHDRAWAL'
    assert tx2['amount'] == 20000
    assert tx2['memo'] == '출금 테스트'

    tx3 = data['history'][2]
    assert tx3['type'] == 'DEPOSIT'
    assert tx3['amount'] == 10000
    assert tx3['memo'] == '입금 테스트'


@pytest.mark.django_db
def test_transaction_history_account_not_found(authenticated_client):
    client, _ = authenticated_client

    res = client.get('/api/accounts/9999999999/history')
    assert res.status_code == 404
    assert "[ERROR] Account not found" in res.content.decode()


@pytest.mark.django_db
def test_deposit_duplicate_transaction_id(authenticated_client):
    client, user = authenticated_client

    account = Account.objects.create(user=user, account_number="3000000000", nickname="중복체크계좌", balance=50000)

    # 동일한 transaction_id를 두 번 사용
    tx_id = str(uuid.uuid4())

    payload = {
        "account_number": account.account_number,
        "amount": 10000,
        "memo": "중복 입금 테스트",
        "transaction_id": tx_id
    }

    # 첫 번째 요청: 성공 기대
    res1 = client.post("/api/transactions/deposit", data=json.dumps(payload), content_type="application/json")
    assert res1.status_code == 200
    assert res1.json()["transaction"]["transaction_id"] == tx_id

    # 두 번째 요청 (같은 transaction_id): 409 Conflict 기대
    res2 = client.post("/api/transactions/deposit", data=json.dumps(payload), content_type="application/json")
    assert res2.status_code == 409
    assert "[ERROR] Duplicate transaction" in res2.content.decode()