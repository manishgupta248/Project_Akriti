from django.core.exceptions import ValidationError
import os

def validate_pdf(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext != '.pdf':
        raise ValidationError('Only PDF files are allowed.')
    if value.size > 5 * 1024 * 1024:  # 5MB limit
        raise ValidationError('File size must be under 5MB.')