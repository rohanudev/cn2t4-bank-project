from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login, name='login'),
    path('refresh', views.refresh_token, name='refresh_token'),
    path('logout', views.logout, name='logout'),
]