import logging
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that retrieves the access token from an HttpOnly cookie
    named 'access_token' instead of the Authorization header. The token is expected to be set
    by views such as RegisterView or CustomTokenRefreshView. Falls back to the Authorization
    header only if ALLOW_HEADER_AUTH is True in settings.
    """

    def authenticate(self, request):
        """
        Authenticate the request using the access token stored in the 'access_token' cookie.

        Args:
            request: The HTTP request object.

        Returns:
            tuple: (user, validated_token) if authentication succeeds, None if no token is provided.

        Raises:
            AuthenticationFailed: If the token is invalid, expired, or authentication fails.
        """
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            logger.debug("No access token found in cookies.")
            if getattr(settings, 'ALLOW_HEADER_AUTH', False):
                header = self.get_header(request)
                if header is None:
                    return None
                raw_token = self.get_raw_token(header)
                if raw_token is None:
                    return None
            else:
                return None

        try:
            # Note: get_validated_token checks blacklist if token_blacklist app is enabled
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            if not user.is_active:
                logger.warning(f"Inactive user attempted authentication: {user.email}")
                raise AuthenticationFailed(_('User account is disabled.'), code='user_inactive')
            logger.debug(f"User authenticated successfully: {user.email}")
            return (user, validated_token)
        except InvalidToken as e:
            logger.warning(f"Invalid token attempt: {str(e)}")
            raise AuthenticationFailed(_('Invalid or expired token.'), code='invalid_token') from e
        except get_user_model().DoesNotExist:
            logger.error("User associated with token not found.")
            raise AuthenticationFailed(_('User not found.'), code='user_not_found')
        except Exception as e:
            logger.error(f"Unexpected authentication error: {str(e)}")
            raise AuthenticationFailed(_('Authentication failed.'), code='authentication_failed') from e