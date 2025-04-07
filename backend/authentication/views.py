from django.shortcuts import render

import json
import boto3
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import User

REGION = 'ap-northeast-2'
CLIENT_ID = 'ap-northeast-2_Xg2ntQOxX'

client = boto3.client('cognito-idp', region_name=REGION)

@csrf_exempt
def signup(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST 요청만 허용됩니다.'}, status=405)

    try:
        data = json.loads(request.body)
        email = data['email']
        password = data['password']
        name = data['name']
        phone = data['phone']
        birthdate = data['birthdate']

        # 1. Cognito에 회원가입 요청
        cognito_response = client.sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name},
                {'Name': 'phone_number', 'Value': phone},  # +821012345678 형식 필요
                {'Name': 'birthdate', 'Value': birthdate}
            ]
        )

        # 2. MySQL DB에 사용자 정보 저장
        User.objects.create(
            email=email,
            name=name,
            phone=phone,
            birthdate=birthdate,
            # cognito_sub는 이메일 인증 후 로그인 시 업데이트 가능
        )

        return JsonResponse({'message': '회원가입 성공! 이메일을 확인해주세요.'}, status=201)

    except client.exceptions.UsernameExistsException:
        return JsonResponse({'error': '이미 존재하는 사용자입니다.'}, status=400)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST 요청만 허용됩니다.'}, status=405)

    try:
        data = json.loads(request.body)
        email = data['email']
        password = data['password']

        # 1. Cognito 로그인
        response = client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password,
            }
        )

        auth_result = response['AuthenticationResult']
        id_token = auth_result['IdToken']
        access_token = auth_result['AccessToken']

        # 2. JWT에서 sub 추출 (서명 검증 생략)
        decoded_token = jwt.decode(id_token, options={"verify_signature": False})
        sub = decoded_token.get('sub')

        # 3. 사용자 DB에 sub 저장
        user = User.objects.get(email=email)
        user.cognito_sub = sub
        user.save()

        # 4. 토큰을 클라이언트에 전달
        return JsonResponse({
            'message': '로그인 성공',
            'id_token': id_token,
            'access_token': access_token,
        })

    except client.exceptions.NotAuthorizedException:
        return JsonResponse({'error': '이메일 또는 비밀번호가 잘못되었습니다.'}, status=401)
    except client.exceptions.UserNotConfirmedException:
        return JsonResponse({'error': '이메일 인증이 필요합니다.'}, status=403)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)    
    
from .auth import jwt_required

@csrf_exempt
@jwt_required
def user_info(request):
    user = request.user  # 데코레이터에서 주입됨

    return JsonResponse({
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "birthdate": user.birthdate,
    })    