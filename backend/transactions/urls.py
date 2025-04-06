from django.urls import include, path
from . import views

urlpatterns = [
    path('deposit', views.deposit, name='deposit'),
    path('withdraw', views.withdraw, name='withdraw'),
    path('transfer', views.transfer, name='transfer'),
    path('validate_account', views.validate_account, name='validate_account'),
]