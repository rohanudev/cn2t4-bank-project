import boto3
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import User
from .serializers import UserDetailSerializer
from django.conf import settings

REGION = 'ap-northeast-2'
CLIENT_ID = '155u00i0o1sum2a4dmphpuu54a'

client = boto3.client('cognito-idp', region_name=REGION)


class UserCreateView(APIView):
    def post(self, request):
        data = request.data

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        birthdate = data.get('birthdate')

        if not all([email, password, name, phone, birthdate]):
            return Response({'error': '모든 항목을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        # 전화번호 E.164 포맷 변환
        if phone.startswith('0'):
            phone = '+82' + phone[1:]

        try:
            # Cognito에 회원가입 요청
            response = client.sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                Password=password,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'given_name', 'Value': name},
                    {'Name': 'phone_number', 'Value': phone},
                    {'Name': 'birthdate', 'Value': birthdate},
                ]
            )

            user_sub = response['UserSub']

            # DB에 사용자 생성 (Cognito의 sub를 UUID로 사용)
            user = User.objects.create(
                user_id=user_sub,
                name=name,
                phone=phone,
                email=email,
            )

            return Response({
                "userId": user.user_id,
                "message": "User created successfully"
            }, status=status.HTTP_200_OK)

        except client.exceptions.UsernameExistsException:
            return Response({'error': '이미 존재하는 사용자입니다.'}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDetailView(APIView):
    def get(self, request, userId):
        user = get_object_or_404(User, user_id=userId)
        serializer = UserDetailSerializer(user)  # 모든 필드 포함된 Serializer 사용
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, userId):
        user = get_object_or_404(User, user_id=userId)
        serializer = UserDetailSerializer(user, data=request.data, partial=True)  # 업데이트도 전체 필드 포함된 Serializer 사용
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully"}, status=status.HTTP_200_OK)
        return Response({"error": "[ERROR] Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, userId):
        user = get_object_or_404(User, user_id=userId)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
