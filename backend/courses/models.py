from django.db import models, transaction
from academics.models import Department
from django.contrib.auth import get_user_model
from .validators import validate_pdf
from enum import Enum

User = get_user_model()

# Enums for Choices
class CourseCategory(Enum):
    COMPULSORY = "Compulsory"
    ELECTIVE = "Elective"

    @classmethod
    def choices(cls):
        return [(key.name, key.value) for key in cls]

class CourseType(Enum):
    DISSERTATION = "Dissertation"
    LABORATORY = "Laboratory"
    PRACTICAL = "Practical"
    PROJECT = "Project"
    THEORY = "Theory"
    THEORY_AND_PRACTICAL = "Theory and Practical"
    TUTORIAL = "Tutorial"

    @classmethod
    def choices(cls):
        return [(key.name, key.value) for key in cls]

class CBCSCategory(Enum):
    MAJOR = "Major"
    MINOR = "Minor"
    CORE = "Core"
    DSE = "Discipline Specific Elective"
    GE = "Generic Elective"
    OE = "Open Elective"
    VAC = "Value Added Course"
    AECC = "Ability Enhancement Compulsory Course"
    SEC = "Skill Enhancement Course"
    MDC = "Multi-Disciplinary Course"
    IDC = "Inter-Disciplinary Course"

    @classmethod
    def choices(cls):
        return [(key.name, key.value) for key in cls]

class Course(models.Model):
    """
    Represents an academic course with a unique code, linked to a department.
    """
    course_code = models.CharField(
        max_length=10,
        unique=True,
        primary_key=True,
        help_text="Unique code for the course (e.g., CS101).",
    )
    course_name = models.CharField(
        max_length=255,
        help_text="Full name of the course."
    )
    course_category = models.CharField(
        max_length=10,
        choices=CourseCategory.choices(),
        help_text="Category of the course (Compulsory/Elective)."
    )
    type = models.CharField(
        max_length=20,
        choices=CourseType.choices(),
        help_text="Type of the course (e.g., Theory, Practical)."
    )
    cbcs_category = models.CharField(
        max_length=10,
        choices=CBCSCategory.choices(),
        help_text="CBCS category of the course."
    )
    maximum_credit = models.PositiveIntegerField(
        choices=[(i, str(i)) for i in range(21)],
        help_text="Maximum credit points (0-20)."
    )
    discipline = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='courses',
        help_text="Department offering the course."
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_courses',
        editable=False,
    )
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_courses',
        editable=False,
    )
    updated_at = models.DateTimeField(auto_now=True, editable=False)
    is_deleted = models.BooleanField(
        default=False,
        help_text="Marks the course as soft-deleted."
    )

    class Meta:
        indexes = [
            models.Index(fields=['course_code']),
            models.Index(fields=['discipline']),
        ]

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"

    @property
    def is_active(self):
        """Returns True if the course is not soft-deleted."""
        return not self.is_deleted

class Syllabus(models.Model):
    """
    Represents a syllabus document for a specific course version.
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        to_field='course_code',
        related_name='syllabi',
        help_text="Course this syllabus belongs to."
    )
    course_name = models.CharField(
        max_length=255,
        editable=False,
        help_text="Auto-populated from the course name."
    )
    syllabus_file = models.FileField(
        upload_to='syllabi/%Y/%m/%d/',
        validators=[validate_pdf],
        max_length=255,
        help_text="Upload a PDF syllabus file."
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='uploaded_syllabi',
        editable=False,
        help_text="User who uploaded the syllabus."
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        editable=False,
        help_text="Timestamp of upload."
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_syllabi',
        editable=False,
        help_text="User who last updated the syllabus."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        editable=False,
        help_text="Timestamp of last update."
    )
    description = models.TextField(
        blank=True,
        help_text="Optional description of the syllabus."
    )
    version = models.CharField(
        max_length=10,
        default='1.0',
        help_text="Version of the syllabus (e.g., 1.0, 2.1)."
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="Marks the syllabus as soft-deleted."
    )

    class Meta:
        verbose_name_plural = 'Syllabi'
        unique_together = ('course', 'version')
        indexes = [
            models.Index(fields=['course', 'version']),
            models.Index(fields=['uploaded_at']),
        ]

    def __str__(self):
        return f"{self.course.course_code} - Version {self.version}"

    def save(self, *args, **kwargs):
        """Auto-populate course_name from the related Course."""
        if self.course:
            self.course_name = self.course.course_name
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        """Returns True if the syllabus is not soft-deleted."""
        return not self.is_deleted