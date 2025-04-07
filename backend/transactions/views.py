# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from accounts.models import Account
from transactions.models import Transaction
from django.utils.timezone import now
from django.db import transaction as db_transaction


@csrf_exempt
def deposit(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "[ERROR] Method Not Allowed"}, status=405)

    try:
        data = json.loads(request.body)
        account_number = data.get("account_number")
        amount = int(data.get("amount", 0))
        memo = data.get("memo", "입금")

        if amount <= 0:
            return JsonResponse({"success": False, "message": "[ERROR] Invalid amount"}, status=400)

        try:
            account = Account.objects.get(account_number=account_number)
        except Account.DoesNotExist:
            return JsonResponse({"success": False, "message": "[ERROR] Account not found"}, status=404)

        with db_transaction.atomic(): # 트랜잭션 정합성 보장 (중간에 에러날  시 DB 반영 안됨)
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

            return JsonResponse({
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

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "[ERROR] Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)

    
@csrf_exempt
def withdraw(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "[ERROR] Method Not Allowed"}, status=405)

    try:
        data = json.loads(request.body)
        account_number = data.get("account_number")
        amount = int(data.get("amount", 0))
        memo = data.get("memo", "출금")

        if amount <= 0:
            return JsonResponse({"success": False, "message": "[ERROR] Invalid amount"}, status=400)

        try:
            account = Account.objects.get(account_number=account_number)
        except Account.DoesNotExist:
            return JsonResponse({"success": False, "message": "[ERROR] Account not found"}, status=404)

        if account.balance < amount:
            return JsonResponse({"success": False, "message": "[ERROR] Insufficient balance"}, status=400)

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

            return JsonResponse({
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

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "[ERROR] Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)

    
@csrf_exempt
def transfer(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "[ERROR] Method Not Allowed"}, status=405)

    try:
        data = json.loads(request.body)
        from_account_number = data.get("from_account")
        to_account_number = data.get("to_account")
        amount = int(data.get("amount", 0))
        memo = data.get("memo", "송금")

        if amount <= 0:
            return JsonResponse({"success": False, "message": "[ERROR] Invalid amount"}, status=400)

        if from_account_number == to_account_number:
            return JsonResponse({"success": False, "message": "[ERROR] Cannot transfer to the same account"}, status=400)

        try:
            from_account = Account.objects.get(account_number=from_account_number)
            to_account = Account.objects.get(account_number=to_account_number)
        except Account.DoesNotExist:
            return JsonResponse({"success": False, "message": "[ERROR] One or both accounts not found"}, status=404)

        if from_account.balance < amount:
            return JsonResponse({"success": False, "message": "[ERROR] Insufficient balance"}, status=400)

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

            return JsonResponse({
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

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "[ERROR] Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)
    
@csrf_exempt
def validate_account(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "[ERROR] Method Not Allowed"}, status=405)

    try:
        data = json.loads(request.body)
        account_id = data.get("account_id")
        account_number = data.get("account_number")


        if not account_id and not account_number:
            return JsonResponse({"success": False, "message": "[ERROR] Missing account number"}, status=400)

        try:
            if account_id:
                account = Account.objects.get(account_id=account_id)
            else:
                account = Account.objects.get(account_number=account_number)
                
            return JsonResponse({
                "success": True,
                "account": {
                    "account_number": account.account_number,
                    "account_name": account.nickname,
                    "owner": account.user.name,  # 또는 account.user.username 등
                    "balance": account.balance
                }
            })
        except Account.DoesNotExist:
            return JsonResponse({"success": False, "message": "[ERROR] Account not found"}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "[ERROR] Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": f"[ERROR] {str(e)}"}, status=500)