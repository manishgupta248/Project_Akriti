from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema, OpenApiExample
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer
from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class RegisterView(APIView):
    @extend_schema(
        request=RegisterSerializer,
        responses={201: UserSerializer},
        examples=[
            OpenApiExample(
                'Valid registration',
                value={
                    'email': 'test@example.com',
                    'first_name': 'Test',
                    'last_name': 'User',
                    'mobile_number': '9876543210',
                    'password': 'testpassword123',
                    'profile_picture': '<file_upload>'
                },
                request_only=True,
            ),
        ],
        description='Register a new user and return user details with tokens set in cookies.'
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response = Response({
                'message': 'Registration successful',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            secure = not settings.DEBUG
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=True,
                secure=secure,
                samesite='Strict',
                max_age=15 * 60
            )
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=secure,
                samesite='Strict',
                max_age=1 * 24 * 60 * 60
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(APIView):
    @extend_schema(
        request=LoginSerializer,
        responses={200: UserSerializer},
        examples=[
            OpenApiExample(
                'Valid login',
                value={'email': 'test@example.com', 'password': 'testpassword123'},
                request_only=True,
            ),
        ],
        description='Log in a user and return user details with tokens in cookies.'
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if user:
            refresh = RefreshToken.for_user(user)
            response = Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            secure = not settings.DEBUG
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=True,
                secure=secure,
                samesite='Strict',
                max_age=15 * 60
            )
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=secure,
                samesite='Strict',
                max_age=1 * 24 * 60 * 60
            )
            return response
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={204: {'description': 'Logout successful'}},
        description='Log out a user by blacklisting the refresh token and clearing cookies.'
    )
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        # Blacklist refresh token if present
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # Ignore invalid/expired token errors
        
        # Return success and clear cookies
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserSerializer},
        description='Retrieve the authenticated user’s profile details.',
        methods=['GET']
    )
    @extend_schema(
        request=UserSerializer,
        responses={200: UserSerializer},
        description='Update the authenticated user’s profile details.',
        examples=[
            OpenApiExample(
                'Update example',
                value={'first_name': 'Updated', 'mobile_number': '9123456789', 'profile_picture': '<file_upload>'},
                request_only=True,
            ),
        ],
        methods=['PUT']
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: {'description': 'Password changed successfully'}},
        examples=[
            OpenApiExample(
                'Change password',
                value={'old_password': 'testpassword123', 'new_password': 'newpassword456'},
                request_only=True,
            ),
        ],
        description='Change the authenticated user’s password.'
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except TokenError:
                    pass
            response = Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenRefreshView(APIView):
    @extend_schema(
        responses={200: {'description': 'Token refreshed successfully'}},
        description='Refresh the access token using the refresh token from cookies.'
    )
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            response = Response({'message': 'Token refreshed successfully'}, status=status.HTTP_200_OK)
            secure = not settings.DEBUG
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=True,
                secure=secure,
                samesite='Strict',
                max_age=15 * 60
            )
            if getattr(settings, 'ROTATE_REFRESH_TOKENS', True):
                new_refresh_token = str(token)
                response.set_cookie(
                    key='refresh_token',
                    value=new_refresh_token,
                    httponly=True,
                    secure=secure,
                    samesite='Strict',
                    max_age=1 * 24 * 60 * 60
                )
            return response
        except TokenError:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)