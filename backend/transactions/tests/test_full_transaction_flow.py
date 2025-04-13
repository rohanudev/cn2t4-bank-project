import pytest
from django.urls import reverse
from accounts.models import Account
from transactions.models import Transaction

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