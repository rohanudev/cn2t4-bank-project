from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import User
from .serializers import UserCreateSerializer, UserDetailSerializer

class UserCreateView(APIView):
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # user 객체 저장
            return Response({"userId": user.user_id, "message": "User created successfully"}, status=status.HTTP_200_OK)
        return Response({"error": "[ERROR] Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

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
