from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, FacultyChoicesView

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    path('', include(router.urls)),
    path('faculty-choices/', FacultyChoicesView.as_view(), name='faculty-choices'),
]

"""
Note: With the namespace, endpoints will now be accessible as:
    GET /academic/departments/ (list departments)
    GET /academic/departments/<id>/ (retrieve a department)
    POST /academic/departments/ (create a department, requires auth)
    PUT /academic/departments/<id>/ (update a department, requires auth)
    DELETE /academic/departments/<id>/ (soft-delete a department, requires auth)
    GET /academic/faculty-choices/ (faculty choices, no auth required)
"""