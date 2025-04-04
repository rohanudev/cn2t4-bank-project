# urls.py
from django.urls import path
from .views import CreateAccountView, UserAccountsView, AccountDetailView, AccountUpdateView, AccountDeleteView

urlpatterns = [
    path('', CreateAccountView.as_view(), name='create-account'),
    path('<uuid:userId>', UserAccountsView.as_view(), name='user-accounts'),
    path('detail/<uuid:account_id>', AccountDetailView.as_view(), name='account-detail'),
    path('<uuid:account_id>', AccountUpdateView.as_view(), name='account-update'),
    path('<uuid:account_id>', AccountDeleteView.as_view(), name='account-delete'),
]