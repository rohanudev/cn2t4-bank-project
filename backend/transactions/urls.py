from django.urls import include, path
from .views import DepositView, WithdrawView, TransferView, ValidateAccountView, TransactionHistoryView

urlpatterns = [
    path('deposit', DepositView.as_view(), name='deposit'),
    path('withdraw', WithdrawView.as_view(), name='withdraw'),
    path('transfer', TransferView.as_view(), name='transfer'),
    path('validate_account', ValidateAccountView.as_view(), name='validate_account'),
]