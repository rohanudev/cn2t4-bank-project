import uuid
import pytest
from accounts.models import Account
from transactions.models import Transaction
from users.models import User

@pytest.mark.django_db(transaction=True)
def test_massive_deposit_balance_consistency():
    # 테스트용 사용자 확보 (이미 존재하면 가져오기)
    user, _ = User.objects.get_or_create(
        email="testuser@example.com",
        defaults={"name": "테스트유저", "user_id": "74a8fd6c-50e1-70af-4e7a-99188d1c0b6f", "phone": "+820000000000"}
    )

    # 테스트용 계좌 확보
    account, _ = Account.objects.get_or_create(
        account_number="8624213481567",
        defaults={
            "nickname": "테스트계좌",
            "user": user,
            "balance": 0
        }
    )

    # 테스트 전 초기화
    account.balance = 0
    account.save()
    Transaction.objects.filter(to_account=account, type="DEPOSIT").delete()

    deposit_amount = 100
    transaction_count = 10_000
    total_deposit = deposit_amount * transaction_count

    transactions = []
    for _ in range(transaction_count):
        tx_id = uuid.uuid4()
        transactions.append(Transaction(
            transaction_id=tx_id,
            type="DEPOSIT",
            status="SUCCESS",
            to_account=account,
            amount=deposit_amount,
            balance_after=account.balance + deposit_amount,
            memo="자동입금"
        ))
        account.balance += deposit_amount

    Transaction.objects.bulk_create(transactions)
    account.save()

    account.refresh_from_db()
    assert account.balance == total_deposit, f"잔액 불일치: {account.balance} ≠ {total_deposit}"

    tx_count = Transaction.objects.filter(to_account=account, type="DEPOSIT").count()
    assert tx_count == transaction_count, f"트랜잭션 수 불일치: {tx_count} ≠ {transaction_count}"