from rest_framework import serializers
import re
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """Serializer for retrieving and displaying CustomUser details."""
    #full_name = serializers.CharField(source='full_name', read_only=True)
    profile_picture = serializers.ImageField(use_url=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'first_name', 'last_name', 'full_name', 'mobile_number',
            'date_joined', 'last_updated', 'profile_picture'
        ]
        read_only_fields = ['date_joined', 'last_updated'] #, 'full_name'

    def validate_first_name(self, value):
        if len(value) > 50:
            raise serializers.ValidationError("First name cannot exceed 50 characters.")
        return value.strip().title()

    def validate_last_name(self, value):
        if len(value) > 50:
            raise serializers.ValidationError("Last name cannot exceed 50 characters.")
        return value.strip().title()

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for registering a new CustomUser."""
    password = serializers.CharField(write_only=True, min_length=8)
    profile_picture = serializers.ImageField(required=False, max_length=None, allow_empty_file=False)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'first_name', 'last_name', 'mobile_number', 'password',
            'profile_picture'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_mobile_number(self, value):
        if value is None:
            return value
        if CustomUser.objects.filter(mobile_number=value).exists():
            raise serializers.ValidationError("A user with this mobile number already exists.")
        return value

    def validate_profile_picture(self, value):
        if value:
            if value.size > 2 * 1024 * 1024:  # 2MB limit
                raise serializers.ValidationError("Profile picture must be less than 2MB.")
        return value

    def validate_first_name(self, value):
        return value.strip().title()

    def validate_last_name(self, value):
        return value.strip().title()

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            mobile_number=validated_data.get('mobile_number', None),
            password=validated_data['password'],
        )
        if 'profile_picture' in validated_data:
            user.profile_picture = validated_data['profile_picture']
            user.save()
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing a user's password."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("New password must be at least 8 characters long.")
        if not re.search(r'[0-9]', value) or not re.search(r'[!@#$%^&*]', value):
            raise serializers.ValidationError(
                "New password must contain at least one number and one special character."
            )
        return value

    def validate(self, data):
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError("New password must be different from the old password.")
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance