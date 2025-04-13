from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from users.models import User
from .models import Account
from authentication.auth import jwt_required
from django.utils.decorators import method_decorator

@method_decorator(jwt_required, name="post")
class CreateAccountView(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        nickname = request.data.get("nickname", "")
        balance = request.data.get("balance", 0)

        user = get_object_or_404(User, user_id=user_id)

        account = Account.objects.create(
            user=user,
            nickname=nickname,
            balance=balance,
            status="OPEN"
        )

        return Response({
            "account_id": str(account.account_id),
            "account_number": account.account_number,
            "user_id": str(user.user_id),
            "nickname": account.nickname,
            "balance": account.balance,
            "status": account.status
        }, status=status.HTTP_201_CREATED)

@method_decorator(jwt_required, name="get")
class UserAccountsView(APIView):
    def get(self, request, userId):
        user = get_object_or_404(User, user_id=userId)
        accounts = Account.objects.filter(user=user)

        account_data = [
            {
                "account_id": str(account.account_id),
                "account_number": account.account_number,
                "nickname": account.nickname,
                "balance": account.balance,
                "status": account.status,
            }
            for account in accounts
        ]

        return Response(account_data, status=status.HTTP_200_OK)

@method_decorator(jwt_required, name="get")
@method_decorator(jwt_required, name="put")
@method_decorator(jwt_required, name="delete")
class AccountDetailView(APIView):
    def get(self, request, accountId):
        account = get_object_or_404(Account, account_id=accountId)
        return Response({
            "account_id": str(account.account_id),
            "account_number": account.account_number,
            "user_id": str(account.user.user_id),
            "nickname": account.nickname,
            "balance": account.balance,
            "status": account.status,
            "created_at": account.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }, status=status.HTTP_200_OK)

    def put(self, request, accountId):
        account = get_object_or_404(Account, account_id=accountId)

        account.nickname = request.data.get("nickname", account.nickname)
        account.balance = request.data.get("balance", account.balance)
        account.status = request.data.get("status", account.status)

        account.save()
        return Response({"message": "Account updated successfully"}, status=status.HTTP_200_OK)

    def delete(self, request, accountId):
        account = get_object_or_404(Account, account_id=accountId)

        if account.status == "CLOSED":
            return Response({"error": "Account already closed"}, status=status.HTTP_400_BAD_REQUEST)

        account.status = "CLOSED"
        account.save()
        return Response({"message": "Account closed successfully"}, status=status.HTTP_200_OK)
