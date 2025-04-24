import os
import jwt
from jwt import PyJWKClient
import requests
from django.http import JsonResponse
from users.models import User

JWKS_URL = "https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_Xg2ntQOxX/.well-known/jwks.json"
ISSUER = "https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_Xg2ntQOxX"

# 최신 PyJWT 방식: JWK Client 준비
jwk_client = PyJWKClient(JWKS_URL)

def jwt_required(view_func):
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authorization 헤더가 없습니다."}, status=401)

        token = auth_header.split(" ")[1]

        try:
            # 토큰으로부터 서명 키 추출
            signing_key = jwk_client.get_signing_key_from_jwt(token).key

            # JWT 서명 및 클레임 검증
            decoded = jwt.decode(
                token,
                key=signing_key,
                algorithms=["RS256"],
                issuer=ISSUER,
                options={"verify_aud": False},
                leeway=30
            )

            # sub 값으로 사용자 조회
            sub = decoded.get("sub")
            user = User.objects.filter(user_id=sub).first()
            if not user:
                return JsonResponse({"error": "사용자를 찾을 수 없습니다."}, status=403)

            request.user = user
            return view_func(request, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "토큰이 만료되었습니다."}, status=401)
        except jwt.InvalidTokenError as e:
            return JsonResponse({"error": f"유효하지 않은 토큰입니다. {str(e)}"}, status=401)
        except Exception as e:
            return JsonResponse({"error": f"서버 오류: {str(e)}"}, status=500)

    return wrapper