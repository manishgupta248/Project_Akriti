from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.db import models, IntegrityError
from django.utils import timezone
from django.core.exceptions import ValidationError

class CustomUserManager(BaseUserManager):
    """Manager for handling CustomUser creation."""

    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        try:
            user = self.model(
                email=email,
                first_name=first_name.strip().title(),
                last_name=last_name.strip().title(),
                **extra_fields
            )
            user.set_password(password)
            user.save(using=self._db)
        except IntegrityError as e:
            if 'email' in str(e).lower():
                raise ValueError(f"A user with the email '{email}' already exists.")
            raise
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, first_name, last_name, password, **extra_fields)

class CustomUser(AbstractUser):
    """Custom user model with email as the primary identifier."""

    username = None  # Remove username field

    email = models.EmailField(
        unique=True,
        max_length=255,
        db_index=True,
        verbose_name="Email Address",
        help_text="Enter a valid email address.",
    )
    first_name = models.CharField(
        max_length=50,  # Reduced from 150
        blank=False,
        verbose_name="First Name",
        db_index=True,  # Added for potential search
    )
    last_name = models.CharField(
        max_length=50,  # Reduced from 150
        blank=False,
        verbose_name="Last Name",
        db_index=True,  # Added for potential search
    )
    mobile_number = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r'^[6-9]\d{9}$',
                message='Enter a valid Indian mobile number (10 digits, starting with 6-9).',
            )
        ],
        blank=True,
        null=True,
        verbose_name="Mobile Number",
        help_text="Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
    )
    date_joined = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def user_profile_pic_path(instance, filename):
        ext = filename.split('.')[-1]
        filename = f"{instance.email}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
        return f"profile_pics/{filename}"

    profile_picture = models.ImageField(
        upload_to=user_profile_pic_path,
        blank=True,
        null=True,
        verbose_name="Profile Picture",
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['email']
        verbose_name = "User"
        verbose_name_plural = "Users"
        indexes = [
            models.Index(fields=['first_name', 'last_name'], name='name_idx'),
        ]