from rest_framework import serializers
from .models import User

# 🔹 사용자 생성용 Serializer (name, phone, email만 입력 가능)
class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'phone', 'email']  # user_id, status, created_at 자동 생성됨

# 🔹 사용자 조회/업데이트용 Serializer (모든 필드 포함)
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # 모든 필드 포함 (user_id, status, created_at 등)
