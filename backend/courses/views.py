from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Course, Syllabus, CourseCategory, CourseType, CBCSCategory
from .serializers import CourseSerializer, SyllabusSerializer, ChoiceSerializer
from rest_framework.pagination import PageNumberPagination

class CoursePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'  # e.g., ?limit=20
    max_page_size = 100

class SyllabusPagination(PageNumberPagination):
    page_size = 5  # Fewer items for syllabi
    page_size_query_param = 'limit'
    max_page_size = 50

class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for CRUD operations on Course model."""
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['discipline', 'course_category', 'type', 'cbcs_category', 'is_deleted']
    # Order by course_code to ensure consistent pagination
    queryset = Course.objects.all().order_by('course_code')
    pagination_class = CoursePagination

    def get_permissions(self):
        """Set permissions based on the request method."""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  # Open to all for GET requests
        return [IsAuthenticated()]  # Auth required for POST, PUT, DELETE

    def get_queryset(self):
        """Filter out soft-deleted courses for non-admin users."""
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(is_deleted=False)

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete."""
        instance.is_deleted = True
        instance.updated_by = self.request.user
        instance.save()

class SyllabusViewSet(viewsets.ModelViewSet):
    """ViewSet for CRUD operations on Syllabus model."""
    serializer_class = SyllabusSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'version', 'is_deleted']
    # Order by course__course_code and version for consistent pagination
    queryset = Syllabus.objects.all().order_by('course__course_code', 'version')
    pagination_class = SyllabusPagination

    def get_permissions(self):
        """Set permissions based on the request method."""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  # Open to all for GET requests
        return [IsAuthenticated()]  # Auth required for POST, PUT, DELETE

    def get_queryset(self):
        """Filter out soft-deleted syllabi for non-admin users."""
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(is_deleted=False)

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete."""
        instance.is_deleted = True
        instance.updated_by = self.request.user
        instance.save()

class CourseCategoryChoicesView(APIView):
    """API endpoint to retrieve CourseCategory choices."""
    permission_classes = [AllowAny]

    def get(self, request):
        choices = CourseCategory.choices()
        serializer = ChoiceSerializer(choices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CourseTypeChoicesView(APIView):
    """API endpoint to retrieve CourseType choices."""
    permission_classes = [AllowAny]

    def get(self, request):
        choices = CourseType.choices()
        serializer = ChoiceSerializer(choices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CBCSCategoryChoicesView(APIView):
    """API endpoint to retrieve CBCSCategory choices."""
    permission_classes = [AllowAny]

    def get(self, request):
        choices = CBCSCategory.choices()
        serializer = ChoiceSerializer(choices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)