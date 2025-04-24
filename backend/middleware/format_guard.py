# myproject/middleware/format_guard.py
import json, re
from django.http import HttpResponseBadRequest

PATTERN = re.compile(r"%|{[^{}]*}")   # %, {...} 토큰 둘 다 탐지
MAX_LEN = 4096                       # 성능 위해 너무 긴 문자열은 스킵

class FormatGuardMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1) 쿼리스트링 / 폼
        for v in list(request.GET.values()) + list(request.POST.values()):
            if len(v) <= MAX_LEN and PATTERN.search(v):
                return HttpResponseBadRequest("unsafe input detected")

        # 2) JSON 바디 (필요할 때만)
        if request.content_type.startswith("application/json"):
            try:
                body = json.loads(request.body.decode())
            except ValueError:
                body = None
            if _contains_token(body):
                return HttpResponseBadRequest("unsafe input detected")

        return self.get_response(request)

def _contains_token(obj):
    """재귀적으로 %, {...} 검출"""
    if isinstance(obj, str):
        return len(obj) <= MAX_LEN and PATTERN.search(obj)
    if isinstance(obj, dict):
        return any(_contains_token(v) for v in obj.values())
    if isinstance(obj, (list, tuple, set)):
        return any(_contains_token(x) for x in obj)
    return False
