from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, SyllabusViewSet, CourseCategoryChoicesView,
    CourseTypeChoicesView, CBCSCategoryChoicesView
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'syllabi', SyllabusViewSet, basename='syllabus')

urlpatterns = [
    path('', include(router.urls)),
    path('course-category-choices/', CourseCategoryChoicesView.as_view(), name='course-category-choices'),
    path('course-type-choices/', CourseTypeChoicesView.as_view(), name='course-type-choices'),
    path('cbcs-category-choices/', CBCSCategoryChoicesView.as_view(), name='cbcs-category-choices'),
]