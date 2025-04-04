from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include(('accounts.urls', 'accounts'), namespace='accounts')),  # Namespace 'accounts'
    path('academic/', include(('academics.urls', 'academics'), namespace='academic')),
    path('courses/', include(('courses.urls', 'courses'), namespace='courses')),

    # API Schema and Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serve media files only in debug mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# Note: In production, configure your web server (e.g., Nginx) to serve media files.