from django.contrib import admin
from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin
from .models import Department, Faculty
from django.contrib.auth import get_user_model

User = get_user_model()

class DepartmentResource(resources.ModelResource):
    """Resource class for Department model for import/export."""
    faculty = fields.Field(attribute='faculty', column_name='faculty')
    created_by = fields.Field(
        column_name='created_by',
        attribute='created_by',
        widget=fields.widgets.ForeignKeyWidget(User, 'username')
    )
    updated_by = fields.Field(
        column_name='updated_by',
        attribute='updated_by',
        widget=fields.widgets.ForeignKeyWidget(User, 'username')
    )

    class Meta:
        model = Department
        fields = ('id', 'name', 'faculty', 'created_by', 'created_at', 'updated_by', 'updated_at', 'is_deleted')
        export_order = ('id', 'name', 'faculty', 'created_by', 'created_at', 'updated_by', 'updated_at', 'is_deleted')
        import_id_fields = ('id',)

    def dehydrate_faculty(self, department):
        """Export faculty as the display name instead of the value."""
        return department.get_faculty_display()

    def dehydrate_created_by(self, department):
        """Export created_by as the username."""
        return department.created_by.username if department.created_by else ''

    def dehydrate_updated_by(self, department):
        """Export updated_by as the username."""
        return department.updated_by.username if department.updated_by else ''

    def before_import_row(self, row, **kwargs):
        """Validate and normalize faculty before importing."""
        if 'faculty' in row:
            value = str(row['faculty']).strip()
            choice_dict = {key.value: key.value for key in Faculty}
            display_dict = {key.name.lower(): key.value for key in Faculty}
            if value in choice_dict:
                row['faculty'] = value
            elif value.lower() in display_dict:
                row['faculty'] = display_dict[value.lower()]
            else:
                raise ValueError(f"Invalid faculty value: {value}. Must be one of {list(choice_dict.keys())} or {list(display_dict.keys())}")
        if 'id' in row:
            row['id'] = str(row['id']).strip().zfill(3)

@admin.register(Department)
class DepartmentAdmin(ImportExportModelAdmin):
    resource_class = DepartmentResource
    list_display = ('id', 'name', 'get_faculty', 'created_by', 'created_at', 'updated_by', 'updated_at', 'is_active')
    list_filter = ('faculty', 'created_by', 'updated_by', 'is_deleted')
    search_fields = ('id', 'name', 'created_by__username', 'updated_by__username')
    readonly_fields = ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')

    def get_faculty(self, obj):
        """Display human-readable faculty."""
        return obj.get_faculty_display()

    get_faculty.short_description = 'Faculty'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)