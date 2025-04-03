from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from users.models import User
from .models import Account

class UserAccountsView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, user_id=user_id)  # UUID 기반 유저 조회
        accounts = Account.objects.filter(user_id=user.user_id)  # UUID 기반 계좌 조회
        
        account_data = [
            {
                "account_id": str(account.account_id),
                "nickname": account.nickname,  # 계좌 별명 추가
                "balance": account.balance
            }
            for account in accounts
        ]

        return Response(account_data, status=status.HTTP_200_OK)
