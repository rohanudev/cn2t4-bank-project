from django.urls import include, path
from . import views

urlpatterns = [
    path('hello', views.hello_view),
    path('transactions/', include('transactions.urls')),
]