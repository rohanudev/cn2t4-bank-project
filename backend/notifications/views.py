import boto3
import json
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

from django.shortcuts import get_object_or_404
from authentication.auth import jwt_required
from django.utils.decorators import method_decorator

REGION = 'ap-northeast-2'
SES_SENDER_EMAIL = '0119299@naver.com'
# Create your views here.
# 여기다가 코드 작성할 것

ses = boto3.client('ses', region_name=settings.AWS_REGION)
client = boto3.client('cognito-idp', region_name=settings.AWS_REGION)

@method_decorator(jwt_required, name="post")
class NotificationTransferMoneyView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def send_email(self, to_email, subject, body):
        response = ses.send_email(
            Source = settings.SES_SENDER_EMAIL,
            Destination = {'ToAddresses': [to_email]},
            Message = {
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': body}},
            }
        )
        return response
    
    def get_user_email_from_cognito(access_token):
        response = client.get_user(AccessToken=access_token)

        for attr in response['UserAttributes']:
            if attr['Name'] == 'email':
                return attr['Value']
        return None

    def post(self, request):
        amount = request.data.get("amount")
        toAccountUserEmail = request.data.get("toAccountUserEmail")
        userEmail = request.data.get("userEmail")
        
        try:
            subject = "송금 알림"
            body = f"{amount}원이 성공적으로 이체되었습니다."
            self.send_email(userEmail, subject, body)

            subject = "입금 알림"
            body = f"{amount}원이 성공적으로 입금되었습니다."
            self.send_email(toAccountUserEmail, subject, body)

            return Response({"message": "송금 및 이메일 알림 완료"})
        
        except Exception as e:
            # 에러 로그는 서버에 출력하고, 사용자에게는 일반 메시지
            print(f"[Email Error] {str(e)}")
            return Response({"error": "이메일 전송 중 문제가 발생했습니다. 다시 시도해주세요."}, status=500)