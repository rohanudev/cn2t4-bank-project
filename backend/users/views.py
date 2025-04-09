import boto3
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import User
from .serializers import UserDetailSerializer
from django.conf import settings
from authentication.auth import jwt_required
from django.utils.decorators import method_decorator

REGION = 'ap-northeast-2'
CLIENT_ID = '155u00i0o1sum2a4dmphpuu54a'

client = boto3.client('cognito-idp', region_name=settings.AWS_REGION)

@method_decorator(jwt_required, name="post")
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
                ClientId=settings.COGNITO_CLIENT_ID,
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

@method_decorator(jwt_required, name="post")
class UserConfirmView(APIView):
    def post(self, request):
        data = request.data
        email = data.get('email')
        confirmation_code = data.get('confirmation_code')

        if not email or not confirmation_code:
            return Response({'error': '이메일과 인증 코드를 모두 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Cognito 인증 코드 확인
            client.confirm_sign_up(
                ClientId=settings.COGNITO_CLIENT_ID,
                Username=email,
                ConfirmationCode=confirmation_code,
            )

            return Response({'message': '사용자 인증이 완료되었습니다.'}, status=status.HTTP_200_OK)

        except client.exceptions.CodeMismatchException:
            return Response({'error': '인증 코드가 올바르지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        except client.exceptions.ExpiredCodeException:
            return Response({'error': '인증 코드가 만료되었습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        except client.exceptions.UserNotFoundException:
            return Response({'error': '해당 사용자를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        except client.exceptions.NotAuthorizedException:
            return Response({'error': '이미 인증이 완료된 사용자입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(jwt_required, name="post")
class UserDeactivateView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = boto3.client(
                'cognito-idp',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )

            response = client.admin_disable_user(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                Username=email
            )
            return Response({"message": "User has been deactivated."}, status=status.HTTP_200_OK)
        except client.exceptions.UserNotFoundException:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(jwt_required, name="get")
@method_decorator(jwt_required, name="put")
@method_decorator(jwt_required, name="delete")
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
        # DB에서 사용자 삭제
        user = get_object_or_404(User, user_id=userId)

        try:
            # Cognito에서 사용자 삭제
            response = client.admin_delete_user(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                Username=user.email  # 이메일을 사용하여 삭제
            )

            # DB에서 사용자 정보 삭제
            user.delete()

            return Response({"message": "User deleted successfully from both database and Cognito."}, status=status.HTTP_200_OK)
        
        except client.exceptions.UserNotFoundException:
            return Response({"error": "User not found in Cognito."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
