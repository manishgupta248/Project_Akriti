from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html

CustomUser = get_user_model()

class CustomUserAdmin(UserAdmin):
    """Custom admin interface for the CustomUser model."""

    # Fields to display in the list view
    list_display = ('email', 'first_name', 'last_name', 'mobile_number', 'is_staff', 'date_joined', 'last_login', 'last_updated', 'profile_picture_preview')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login')
    list_per_page = 25  # Pagination for better performance

    # Fields to display in the detail view
    fieldsets = (
        (None, {'fields': ('email', 'password'), 'classes': ('wide',)}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'mobile_number', 'profile_picture'), 'classes': ('wide',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'), 'classes': ('wide',)}),
        (_('Important Dates'), {'fields': ('date_joined', 'last_login', 'last_updated'), 'classes': ('wide',)}),
    )

    # Fields for adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'mobile_number', 'profile_picture', 'password1', 'password2'),
        }),
    )

    # Search and ordering
    search_fields = ('email', 'first_name', 'last_name', 'mobile_number')
    ordering = ('email',)

    # Improve usability for many-to-many fields
    filter_horizontal = ('groups', 'user_permissions')
    # Alternative: autocomplete_fields = ('groups', 'user_permissions') with related model search fields

    # Read-only fields
    readonly_fields = ('date_joined', 'last_login', 'last_updated')

    # Custom display for profile picture
    def profile_picture_preview(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" style="max-height: 50px;" />', obj.profile_picture.url)
        return "No picture"
    profile_picture_preview.short_description = _('Profile Picture')

    # Custom actions
    def make_active(modeladmin, request, queryset):
        queryset.update(is_active=True)
    make_active.short_description = _("Activate selected users")

    def make_inactive(modeladmin, request, queryset):
        queryset.update(is_active=False)
    make_inactive.short_description = _("Deactivate selected users")

    actions = ['make_active', 'make_inactive']

admin.site.register(CustomUser, CustomUserAdmin)