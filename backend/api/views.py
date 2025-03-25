from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse

def hello_view(request):
    return JsonResponse({"data": "Hello from Django API app!"})