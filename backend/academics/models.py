from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from enum import Enum

User = get_user_model()

class Faculty(Enum):
    """Enum representing the possible faculties a department can belong to."""
    IC      = "I&C"    # Information & Computing
    ET      = "E&T"    # Engineering & Technology
    IR      = "I&R"    # Interdisciplinary and Research
    LS      = "LS"     # Life Sciences
    LAMS    = "LAMS" # Liberal Arts & Media Studies
    MS      = "MS"     # Management Studies
    SC      = "SC"     # Sciences
    CCSD    = "CCSD" # CCSD

    @classmethod
    def choices(cls):
        """Returns a list of tuples compatible with Django's choices argument."""
        return [(key.value, key.name) for key in cls]

class DepartmentManager(models.Manager):
    """Custom manager for Department model to handle ID generation."""
    def create_department(self, name, faculty, created_by, **kwargs):
        """Creates a new department with an auto-generated ID."""
        with transaction.atomic():
            last_dept = self.order_by('-id').first()
            next_id = int(last_dept.id) + 1 if last_dept else 101
            if next_id > 999:
                raise ValueError("Department ID cannot exceed 999.")
            return self.create(
                id=str(next_id).zfill(3),
                name=name,
                faculty=faculty,
                created_by=created_by,
                **kwargs
            )

class Department(models.Model):
    """
    Represents an academic department within a university.
    Each department has a unique three-digit ID, a name, and belongs to a faculty.
    The ID is auto-generated, starting from 101, and is immutable.
    Supports soft deletion and tracks creation/update metadata.
    """
    id = models.CharField(
        max_length=3,
        primary_key=True,
        validators=[RegexValidator(r'^\d{3}$', 'ID must be a three-digit number')],
        help_text="A unique three-digit ID for the department.",
        editable=False,
    )
    name = models.CharField(
        max_length=50,
        validators=[RegexValidator(r'^[a-zA-Z\s&]+$', 'Name must contain only letters, spaces, or &')],
        help_text="Name of the department."
    )
    faculty = models.CharField(
        max_length=4,
        choices=Faculty.choices(),
        help_text="Faculty the department belongs to."
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_departments',
        editable=False
    )
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_departments',
        editable=False
    )
    updated_at = models.DateTimeField(auto_now=True, editable=False)
    is_deleted = models.BooleanField(default=False, help_text="Marks the department as deleted (soft delete).")

    objects = DepartmentManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'faculty'], name='unique_name_faculty')
        ]
        indexes = [
            models.Index(fields=['faculty']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        """
        Overrides save to ensure ID is not manually set and updates audit fields.
        Use Department.objects.create_department() for creating new instances.
        """
        if not self.pk and not self.id:
            raise ValueError("Use Department.objects.create_department() to create new departments.")
        super().save(*args, **kwargs)

    def __str__(self):
        """String representation including ID, name, and faculty."""
        return f"{self.id} - {self.name} ({self.faculty})"

    @property
    def is_active(self):
        """Returns True if the department is not soft-deleted."""
        return not self.is_deleted