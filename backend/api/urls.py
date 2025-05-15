from django.urls import include, path
from . import views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('hello', views.hello_view),
    path('authentication/', include('authentication.urls')),
    path('users/', include('users.urls')),
    path('accounts/', include('accounts.urls')),
    path('transactions/', include('transactions.urls')),
    path('notifications/', include('notifications.urls')),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),  # JSON schema
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]