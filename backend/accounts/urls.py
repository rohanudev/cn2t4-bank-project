# urls.py
from django.urls import path
from .views import CreateAccountView, UserAccountsView, AccountDetailView

urlpatterns = [
    path('', CreateAccountView.as_view(), name='create-account'),
    path('user/<uuid:userId>', UserAccountsView.as_view(), name='user-accounts'),
    path('<uuid:accountId>', AccountDetailView.as_view(), name='account-detail'),  # GET, PUT, DELETE
]