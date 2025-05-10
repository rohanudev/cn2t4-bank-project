from .models import Account

def validate_account_number(account_number):
    try:
        account = Account.objects.get(account_number=account_number)
        if account.status == "CLOSED":
            raise ValueError("계좌가 비활성되어 있습니다.")
        return account
    except Account.DoesNotExist:
        raise ValueError("Account not found")