from django.urls import include, path
from . import views

urlpatterns = [
    path('deposit', views.deposit, name='deposit'),
]