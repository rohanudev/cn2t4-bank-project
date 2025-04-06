import jwt
from django.http import JsonResponse
from .models import User

COGNITO_REGION = 'ap-northeast-2'
COGNITO_USER_POOL_ID = 'ap-northeast-2_soUv5mWct'

# Cognito에서 발급한 JWT의 iss값 → 공개 키 가져올 때 사용
JWT_ISSUER = f"https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_soUv5mWct/.well-known/jwks.json"

def jwt_required(view_func):
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authorization 헤더가 없습니다."}, status=401)

        token = auth_header.split(" ")[1]

        try:
            # 여기선 서명 검증 없이 디코딩만
            decoded = jwt.decode(token, options={"verify_signature": False})
            sub = decoded.get("sub")

            # 사용자 조회
            user = User.objects.filter(cognito_sub=sub).first()
            if not user:
                return JsonResponse({"error": "사용자를 찾을 수 없습니다."}, status=403)

            request.user = user  # 인증된 사용자 주입
            return view_func(request, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "토큰이 만료되었습니다."}, status=401)
        except jwt.DecodeError:
            return JsonResponse({"error": "토큰이 유효하지 않습니다."}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return wrapper