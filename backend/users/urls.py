# urls.py
from django.urls import path
from .views import UserCreateView, UserDetailView, UserConfirmView

urlpatterns = [
    path('signup', UserCreateView.as_view(), name='user-create'),
    path('<uuid:userId>', UserDetailView.as_view(), name='user-detail'),
    path('confirm', UserConfirmView.as_view(), name='confirm-user'),
]