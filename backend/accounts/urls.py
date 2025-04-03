# urls.py
from django.urls import path
from .views import CreateAccountView, UserAccountsView

urlpatterns = [
    path('', CreateAccountView.as_view(), name='create-account'),
    path('<uuid:userId>', UserAccountsView.as_view(), name='user-accounts'),
]