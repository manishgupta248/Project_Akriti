from django.contrib import admin
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from import_export.admin import ImportExportModelAdmin
from .models import Course, Syllabus
from academics.models import Department
from django.contrib.auth.models import User
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.contenttypes.models import ContentType

# Custom ImportExportModelAdmin to fix log_actions compatibility
class CustomImportExportModelAdmin(ImportExportModelAdmin):
    def _create_log_entry(self, user_pk, rows, import_type, action_flag):
        content_type = self.model._meta.app_label + '.' + self.model._meta.model_name
        for row in rows:
            LogEntry.objects.log_action(
                user_id=user_pk,
                content_type_id=ContentType.objects.get(model=content_type.lower()).pk,
                object_id=row.object_id,
                object_repr=row.object_repr,
                action_flag=action_flag,
                change_message=row.messages or 'Imported via import-export'
            )

# Resource class for Course model
class CourseResource(resources.ModelResource):
    course_code = fields.Field(
        column_name='course_code',
        attribute='course_code'
    )
    course_name = fields.Field(
        column_name='course_name',
        attribute='course_name'
    )
    course_category = fields.Field(
        column_name='course_category',
        attribute='course_category'
    )
    type = fields.Field(
        column_name='type',
        attribute='type'
    )
    cbcs_category = fields.Field(
        column_name='cbcs_category',
        attribute='cbcs_category'
    )
    maximum_credit = fields.Field(
        column_name='maximum_credit',
        attribute='maximum_credit'
    )
    discipline = fields.Field(
        column_name='discipline',
        attribute='discipline',
        widget=ForeignKeyWidget(Department, 'id')
    )
    is_deleted = fields.Field(
        column_name='is_deleted',
        attribute='is_deleted'
    )

    class Meta:
        model = Course
        fields = ('course_code', 'course_name', 'course_category', 'type', 'cbcs_category', 'maximum_credit', 'discipline', 'is_deleted')
        export_order = ('course_code', 'course_name', 'course_category', 'type', 'cbcs_category', 'maximum_credit', 'discipline', 'is_deleted')
        import_id_fields = ('course_code',)

    def before_import_row(self, row, **kwargs):
        def normalize_choice(value, choices):
            value = str(value).strip()
            choice_dict = {k: k for k, v in choices}
            display_dict = {v.lower(): k for k, v in choices}
            if value in choice_dict:
                return value
            if value.lower() in display_dict:
                return display_dict[value.lower()]
            raise ValueError(f"Invalid value: {value}. Must be one of {list(choice_dict.keys())} or {list(display_dict.keys())}")

        if 'course_category' in row:
            row['course_category'] = normalize_choice(row['course_category'], Course._meta.get_field('course_category').choices)
        if 'type' in row:
            row['type'] = normalize_choice(row['type'], Course._meta.get_field('type').choices)
        if 'cbcs_category' in row:
            row['cbcs_category'] = normalize_choice(row['cbcs_category'], Course._meta.get_field('cbcs_category').choices)
        if 'maximum_credit' in row:
            try:
                value = int(row['maximum_credit'])
                if value not in range(21):
                    raise ValueError(f"Invalid maximum_credit: {value}. Must be between 0 and 20")
                row['maximum_credit'] = value
            except ValueError:
                raise ValueError(f"Invalid maximum_credit: {row['maximum_credit']}. Must be an integer between 0 and 20")
        if 'discipline' in row:
            discipline_id = str(row['discipline']).strip()
            try:
                Department.objects.get(id=discipline_id)
            except Department.DoesNotExist:
                raise ValueError(f"Department with ID '{discipline_id}' does not exist.")
        if 'is_deleted' not in row:
            row['is_deleted'] = False

    def dehydrate_course_category(self, course):
        return course.course_category  # Export raw value, e.g., "COMPULSORY"

    def dehydrate_type(self, course):
        return course.type  # Export raw value, e.g., "THEORY"

    def dehydrate_cbcs_category(self, course):
        return course.cbcs_category  # Export raw value, e.g., "CORE"

    def dehydrate_discipline(self, course):
        return course.discipline.id if course.discipline else ''  # Export ID, e.g., "1"

@admin.register(Course)
class CourseAdmin(CustomImportExportModelAdmin):
    resource_class = CourseResource
    list_display = ('course_code', 'course_name', 'get_course_category', 'get_type', 'get_cbcs_category', 'maximum_credit', 'discipline_name', 'is_deleted')
    list_filter = ('course_category', 'type', 'cbcs_category', 'discipline', 'is_deleted')
    search_fields = ('course_code', 'course_name', 'discipline__name')
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def get_course_category(self, obj):
        return obj.get_course_category_display()
    get_course_category.short_description = 'Course Category'

    def get_type(self, obj):
        return obj.get_type_display()
    get_type.short_description = 'Type'

    def get_cbcs_category(self, obj):
        return obj.get_cbcs_category_display()
    get_cbcs_category.short_description = 'CBCS Category'

    def discipline_name(self, obj):
        return obj.discipline.name if obj.discipline else '-'
    discipline_name.short_description = 'Discipline'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

# Resource class for Syllabus model (unchanged for this fix)
class SyllabusResource(resources.ModelResource):
    course = fields.Field(
        column_name='course',
        attribute='course',
        widget=ForeignKeyWidget(Course, 'course_code')
    )
    uploaded_by = fields.Field(
        column_name='uploaded_by',
        attribute='uploaded_by',
        widget=ForeignKeyWidget(User, 'username')
    )

    class Meta:
        model = Syllabus
        fields = ('id', 'course', 'course_name', 'uploaded_by', 'uploaded_at', 'description', 'version', 'is_deleted')
        export_order = ('id', 'course', 'course_name', 'uploaded_by', 'uploaded_at', 'description', 'version', 'is_deleted')
        import_id_fields = ('id',)

    def dehydrate_course(self, syllabus):
        return syllabus.course.course_code
    def dehydrate_uploaded_by(self, syllabus):
        return syllabus.uploaded_by.username

    def before_import_row(self, row, **kwargs):
        if 'is_deleted' not in row:
            row['is_deleted'] = False

@admin.register(Syllabus)
class SyllabusAdmin(CustomImportExportModelAdmin):
    resource_class = SyllabusResource
    list_display = ('course', 'course_name', 'version', 'uploaded_by', 'uploaded_at', 'description_short', 'is_deleted')
    list_filter = ('uploaded_by', 'uploaded_at', 'is_deleted')
    search_fields = ('course__course_code', 'course_name', 'description')
    readonly_fields = ('course_name', 'uploaded_by', 'uploaded_at', 'updated_by', 'updated_at')

    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = 'Description'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)