from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
import json
from accounts.models import Account
from transactions.utils import validate_account_number
from transactions.models import Transaction
from django.utils.timezone import now
from django.db import transaction as db_transaction
from authentication.auth import jwt_required

class DepositView(APIView):
    @method_decorator(jwt_required)
    def post(self, request):
        try:
            data = request.data
            account_number = data.get("account_number")
            amount = int(data.get("amount", 0))
            memo = data.get("memo", "입금")

            if amount <= 0:
                return Response({"success": False, "message": "[ERROR] Invalid amount"}, status=400)

            try:
                account = validate_account_number(account_number)
            except ValueError as e:
                return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=404)

            with db_transaction.atomic():
                account.balance += amount
                account.save()

                transaction = Transaction.objects.create(
                    type="DEPOSIT",
                    status="SUCCESS",
                    to_account=account,
                    amount=amount,
                    balance_after=account.balance,
                    memo=memo,
                )

                return Response({
                    "success": True,
                    "transaction": {
                        "transaction_id": str(transaction.transaction_id),
                        "type": "deposit",
                        "to_account": account.account_number,
                        "amount": transaction.amount,
                        "balance_after": transaction.balance_after,
                        "timestamp": transaction.created_at.isoformat(),
                        "memo": transaction.memo,
                        "status": transaction.status,
                    }
                })

        except Exception as e:
            return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)

class WithdrawView(APIView):
    @method_decorator(jwt_required)
    def post(self, request):
        try:
            data = request.data
            account_number = data.get("account_number")
            amount = int(data.get("amount", 0))
            memo = data.get("memo", "출금")

            if amount <= 0:
                return Response({"success": False, "message": "[ERROR] Invalid amount"}, status=400)

            try:
                account = validate_account_number(account_number)
            except ValueError as e:
                return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=404)

            if account.balance < amount:
                return Response({"success": False, "message": "[ERROR] Insufficient balance"}, status=400)

            with db_transaction.atomic():
                account.balance -= amount
                account.save()

                transaction = Transaction.objects.create(
                    type="WITHDRAWAL",
                    status="SUCCESS",
                    from_account=account,
                    amount=amount,
                    balance_after=account.balance,
                    memo=memo,
                )

                return Response({
                    "success": True,
                    "transaction": {
                        "transaction_id": str(transaction.transaction_id),
                        "type": "withdrawal",
                        "from_account": account.account_number,
                        "amount": transaction.amount,
                        "balance_after": transaction.balance_after,
                        "timestamp": transaction.created_at.isoformat(),
                        "memo": transaction.memo,
                        "status": transaction.status,
                    }
                })

        except Exception as e:
            return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)

class TransferView(APIView):
    @method_decorator(jwt_required)
    def post(self, request):
        try:
            data = request.data
            from_account_number = data.get("from_account")
            to_account_number = data.get("to_account")
            amount = int(data.get("amount", 0))
            memo = data.get("memo", "송금")

            if amount <= 0:
                return Response({"success": False, "message": "[ERROR] Invalid amount"}, status=400)

            if from_account_number == to_account_number:
                return Response({"success": False, "message": "[ERROR] Cannot transfer to the same account"}, status=400)

            try:
                from_account = validate_account_number(from_account_number)
                to_account = validate_account_number(to_account_number)
            except ValueError as e:
                return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=404)

            if from_account.balance < amount:
                return Response({"success": False, "message": "[ERROR] Insufficient balance"}, status=400)

            with db_transaction.atomic():
                from_account.balance -= amount
                from_account.save()

                to_account.balance += amount
                to_account.save()

                transaction = Transaction.objects.create(
                    type="TRANSFER",
                    status="SUCCESS",
                    from_account=from_account,
                    to_account=to_account,
                    amount=amount,
                    balance_after=from_account.balance,
                    memo=memo,
                )

                return Response({
                    "success": True,
                    "transaction": {
                        "transaction_id": str(transaction.transaction_id),
                        "type": "transfer",
                        "from_account": from_account.account_number,
                        "to_account": to_account.account_number,
                        "amount": transaction.amount,
                        "balance_after": transaction.balance_after,
                        "timestamp": transaction.created_at.isoformat(),
                        "memo": transaction.memo,
                        "status": transaction.status,
                    }
                })

        except Exception as e:
            return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)

class ValidateAccountView(APIView):
    @method_decorator(jwt_required)
    def post(self, request):
        try:
            data = request.data
            account_number = data.get("account_number")

            if not account_number:
                return Response({"success": False, "message": "[ERROR] Missing account number"}, status=400)

            try:
                account = Account.objects.get(account_number=account_number)

                if account.status == "CLOSED":
                    return Response({"success": False, "message": "[ERROR] 계좌가 비활성되어 있습니다."}, status=400)

                return Response({
                    "success": True,
                    "account": {
                        "account_number": account.account_number,
                        "account_name": account.nickname,
                        "owner": account.user.name,
                        "owner_email": account.user.email,
                        "balance": account.balance
                    }
                })
            except Account.DoesNotExist:
                return Response({"success": False, "message": "[ERROR] Account not found"}, status=404)

        except Exception as e:
            return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)

class TransactionHistoryView(APIView):
    @method_decorator(jwt_required)
    def get(self, request, account_number):
        try:
            account = Account.objects.get(account_number=account_number)
            transactions = Transaction.objects.filter(
                from_account=account
            ) | Transaction.objects.filter(
                to_account=account
            )
            transactions = transactions.order_by('-created_at')

            history = []
            for tx in transactions:
                if tx.type == 'TRANSFER':
                    if tx.from_account == account:
                        counterparty_name = tx.to_account.user.name if tx.to_account and tx.to_account.user else "알 수 없음"
                    else:
                        counterparty_name = tx.from_account.user.name if tx.from_account and tx.from_account.user else "알 수 없음"
                else:
                    counterparty_name = None

                history.append({
                    "transaction_id": str(tx.transaction_id),
                    "type": tx.type,
                    "amount": tx.amount,
                    "balance_after": tx.balance_after,
                    "timestamp": tx.created_at.isoformat(),
                    "memo": tx.memo,
                    "status": tx.status,
                    "from_account": tx.from_account.account_number if tx.from_account else None,
                    "to_account": tx.to_account.account_number if tx.to_account else None,
                    "counterparty_name": counterparty_name
                })

            return Response({"success": True, "history": history})

        except Account.DoesNotExist:
            return Response({"success": False, "message": "[ERROR] Account not found"}, status=404)
        except Exception as e:
            return Response({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)