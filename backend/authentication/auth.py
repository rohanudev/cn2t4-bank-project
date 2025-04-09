import jwt
import requests
from jwt.algorithms import RSAAlgorithm
from django.http import JsonResponse
from .models import User

JWKS_URL = "https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_Xg2ntQOxX/.well-known/jwks.json"
ISSUER = "https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_Xg2ntQOxX"

# 앱 시작 시 한 번만 JWK 키셋 로딩해도 좋음 (혹은 캐시)
jwks = requests.get(JWKS_URL).json()
public_keys = {key['kid']: RSAAlgorithm.from_jwk(key) for key in jwks['keys']}

def jwt_required(view_func):
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authorization 헤더가 없습니다."}, status=401)

        token = auth_header.split(" ")[1]

        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header['kid']
            public_key = public_keys.get(kid)

            if not public_key:
                return JsonResponse({"error": "유효한 키를 찾을 수 없습니다."}, status=401)

            decoded = jwt.decode(
                token,
                key=public_key,
                algorithms=["RS256"],
                issuer=ISSUER,
                options={"verify_aud": False}  # 필요한 경우 클라이언트 ID로 설정
            )

            sub = decoded.get("sub")
            user = User.objects.filter(cognito_sub=sub).first()
            if not user:
                return JsonResponse({"error": "사용자를 찾을 수 없습니다."}, status=403)

            request.user = user
            return view_func(request, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "토큰이 만료되었습니다."}, status=401)
        except jwt.InvalidTokenError as e:
            return JsonResponse({"error": "유효하지 않은 토큰입니다."}, status=401)
        except Exception as e:
            return JsonResponse({"error": f"서버 오류: {str(e)}"}, status=500)

    return wrapper