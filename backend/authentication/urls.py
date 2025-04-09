from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login, name='login'),
    path("api/token/refresh/", views.refresh_token_view, name="refresh_token"),
    path('api/refresh', views.refresh_token, name='refresh_token'),
    path('api/logout', views.logout, name='logout'),
]