from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, Faculty
from .serializers import DepartmentSerializer, FacultyChoiceSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for CRUD operations on Department model."""
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['faculty', 'is_deleted']
    # Explicitly order the queryset to avoid pagination warning
    queryset = Department.objects.all().order_by('id')
    # Disable pagination for now (optional; remove this if you want to implement pagination later)
    pagination_class = None

    def get_permissions(self):
        """Set permissions based on the request method."""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  # Open to all for GET requests
        return [IsAuthenticated()]  # Auth required for POST, PUT, DELETE

    def get_queryset(self):
        """Filter out soft-deleted departments for non-admin users."""
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(is_deleted=False)

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete."""
        instance.is_deleted = True
        instance.updated_by = self.request.user
        instance.save()

class FacultyChoicesView(APIView):
    """API endpoint to retrieve Faculty choices for frontend dropdowns."""
    permission_classes = [AllowAny]  # Read-only, no auth required

    def get(self, request):
        choices = Faculty.choices()
        serializer = FacultyChoiceSerializer(choices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)