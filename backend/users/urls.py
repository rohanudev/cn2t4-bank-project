# urls.py
from django.urls import path
from .views import UserCreateView, UserDetailView, UserConfirmView, UserDeactivateView

urlpatterns = [
    path('signup', UserCreateView.as_view(), name='user-create'),
    path('<uuid:userId>', UserDetailView.as_view(), name='user-detail'),
    path('confirm', UserConfirmView.as_view(), name='confirm-user'),
    path('deactivate', UserDeactivateView.as_view(), name='deactivate-user'),
]