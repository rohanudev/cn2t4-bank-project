# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def deposit(request):
    if request.method == "POST":
        return JsonResponse({"success": True, "message": "입금 완료됨."})
    else:
        return JsonResponse({"success": False, "message": "허용되지 않은 요청 방식입니다."}, status=405)