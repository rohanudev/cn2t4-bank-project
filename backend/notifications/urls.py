# urls.py
from django.urls import path
from .views import NotificationTransferMoneyView

urlpatterns = [
    path('', NotificationTransferMoneyView.as_view(), name='transfer-notification')
]