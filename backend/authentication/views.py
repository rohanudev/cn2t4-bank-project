import json
import boto3
import jwt
import traceback
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from users.models import User
from django.conf import settings

CLIENT_ID = '155u00i0o1sum2a4dmphpuu54a'

client = boto3.client('cognito-idp', settings.AWS_REGION)

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return JsonResponse({'error': '이메일과 비밀번호를 입력해주세요.'}, status=400)

        # Cognito 로그인 요청
        response = client.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password,
            },
            ClientId=settings.COGNITO_CLIENT_ID
        )

        auth_result = response.get('AuthenticationResult', {})
        id_token = auth_result.get('IdToken')
        access_token = auth_result.get('AccessToken')
        refresh_token = auth_result.get('RefreshToken')

        # JWT 디코딩해서 sub(UUID) 추출
        decoded = jwt.decode(id_token, options={"verify_signature": False})

        user_sub = decoded['sub']

        # DB에서 user_id=sub 으로 사용자 찾기
        user = User.objects.filter(user_id=user_sub).first()
        if not user:
            return JsonResponse({'error': '로컬 사용자 정보가 없습니다.'}, status=404)

        return JsonResponse({
            'message': '로그인 성공',
            'access_token': access_token,
            'id_token': id_token,
            'refresh_token': refresh_token,
            'user': {
                'user_id': str(user.user_id),
                'email': user.email,
                'name': user.name,
                'phone': user.phone,
                'status': user.status,
            }
        })

    except client.exceptions.UserNotConfirmedException:
        return JsonResponse({'error': '이메일 인증이 완료되지 않았습니다.'}, status=403)
    except client.exceptions.NotAuthorizedException:
        return JsonResponse({'error': '이메일 또는 비밀번호가 잘못되었습니다.'}, status=401)
    except client.exceptions.UserNotFoundException:
        return JsonResponse({'error': '존재하지 않는 사용자입니다.'}, status=404)
    except Exception as e:
        print("[ERROR] 로그인 실패:", str(e))
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def refresh_token_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    # refresh_token을 프론트에서 직접 받거나 세션/쿠키 등에서 가져옴
    refresh_token = request.POST.get("refresh_token")
    if not refresh_token:
        return JsonResponse({"error": "Missing refresh token"}, status=400)

    payload = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "refresh_token": refresh_token
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        response = requests.post(
            "https://ap-northeast-2xg2ntqoxx.auth.ap-northeast-2.amazoncognito.com/oauth2/token",
            data=payload,
            headers=headers
        )
        response.raise_for_status()
        return JsonResponse(response.json())
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": str(e)}, status=400)
    
@csrf_exempt
def refresh_token(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        refresh_token = data.get('refresh_token')

        if not refresh_token:
            return JsonResponse({'error': 'refresh_token이 없습니다.'}, status=400)

        # 새 토큰 요청
        response = client.initiate_auth(
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token,
            },
            ClientId=settings.COGNITO_CLIENT_ID
        )

        new_auth = response.get('AuthenticationResult', {})
        new_access_token = new_auth.get('AccessToken')
        new_id_token = new_auth.get('IdToken')

        return JsonResponse({
            'access_token': new_access_token,
            'id_token': new_id_token
        })

    except client.exceptions.NotAuthorizedException:
        return JsonResponse({'error': '유효하지 않은 refresh_token입니다.'}, status=401)
    except Exception as e:
        print("[ERROR] refresh_token 실패:", str(e))
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def logout(request):
    try:
        # Authorization 헤더에서 access_token 추출
        auth_header = request.headers.get('Authorization')
        access_token = auth_header.split(' ')[1] if auth_header else None

        if access_token:
            # 토큰 폐기 (옵션)
            client.revoke_token(
                Token=access_token,
                ClientId=settings.COGNITO_CLIENT_ID
            )

        response = JsonResponse({'message': '로그아웃 완료'})

        # 쿠키 기반이면 여전히 제거
        response.delete_cookie('access_token')
        response.delete_cookie('id_token')
        response.delete_cookie('refresh_token')

        return response
    except Exception as e:
        print("[ERROR] 로그아웃 처리 실패:", e)
        return JsonResponse({'error': '로그아웃 실패'}, status=500)