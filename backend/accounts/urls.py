from django.urls import path
from .views import (
    RegisterView, CustomTokenObtainPairView, LogoutView,
    UserProfileView, ChangePasswordView, CustomTokenRefreshView
)

app_name = 'accounts'  # Namespace for URL resolution

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]