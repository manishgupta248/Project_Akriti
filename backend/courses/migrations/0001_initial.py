# Generated by Django 5.1.7 on 2025-03-11 09:59

import courses.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('academics', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('course_code', models.CharField(help_text='Unique code for the course (e.g., CS101).', max_length=10, primary_key=True, serialize=False, unique=True)),
                ('course_name', models.CharField(help_text='Full name of the course.', max_length=255)),
                ('course_category', models.CharField(choices=[('COMPULSORY', 'Compulsory'), ('ELECTIVE', 'Elective')], help_text='Category of the course (Compulsory/Elective).', max_length=10)),
                ('type', models.CharField(choices=[('DISSERTATION', 'Dissertation'), ('LABORATORY', 'Laboratory'), ('PRACTICAL', 'Practical'), ('PROJECT', 'Project'), ('THEORY', 'Theory'), ('THEORY_AND_PRACTICAL', 'Theory and Practical'), ('TUTORIAL', 'Tutorial')], help_text='Type of the course (e.g., Theory, Practical).', max_length=20)),
                ('cbcs_category', models.CharField(choices=[('MAJOR', 'Major'), ('MINOR', 'Minor'), ('CORE', 'Core'), ('DSE', 'Discipline Specific Elective'), ('GE', 'Generic Elective'), ('OE', 'Open Elective'), ('VAC', 'Value Added Course'), ('AECC', 'Ability Enhancement Compulsory Course'), ('SEC', 'Skill Enhancement Course'), ('MDC', 'Multi-Disciplinary Course'), ('IDC', 'Inter-Disciplinary Course')], help_text='CBCS category of the course.', max_length=10)),
                ('maximum_credit', models.PositiveIntegerField(choices=[(0, '0'), (1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5'), (6, '6'), (7, '7'), (8, '8'), (9, '9'), (10, '10'), (11, '11'), (12, '12'), (13, '13'), (14, '14'), (15, '15'), (16, '16'), (17, '17'), (18, '18'), (19, '19'), (20, '20')], help_text='Maximum credit points (0-20).')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_deleted', models.BooleanField(default=False, help_text='Marks the course as soft-deleted.')),
                ('created_by', models.ForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_courses', to=settings.AUTH_USER_MODEL)),
                ('discipline', models.ForeignKey(help_text='Department offering the course.', on_delete=django.db.models.deletion.CASCADE, related_name='courses', to='academics.department')),
                ('updated_by', models.ForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_courses', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Syllabus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course_name', models.CharField(editable=False, help_text='Auto-populated from the course name.', max_length=255)),
                ('syllabus_file', models.FileField(help_text='Upload a PDF syllabus file.', max_length=255, upload_to='syllabi/%Y/%m/%d/', validators=[courses.validators.validate_pdf])),
                ('uploaded_at', models.DateTimeField(auto_now_add=True, help_text='Timestamp of upload.')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='Timestamp of last update.')),
                ('description', models.TextField(blank=True, help_text='Optional description of the syllabus.')),
                ('version', models.CharField(default='1.0', help_text='Version of the syllabus (e.g., 1.0, 2.1).', max_length=10)),
                ('is_deleted', models.BooleanField(default=False, help_text='Marks the syllabus as soft-deleted.')),
                ('course', models.ForeignKey(help_text='Course this syllabus belongs to.', on_delete=django.db.models.deletion.CASCADE, related_name='syllabi', to='courses.course')),
                ('updated_by', models.ForeignKey(editable=False, help_text='User who last updated the syllabus.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_syllabi', to=settings.AUTH_USER_MODEL)),
                ('uploaded_by', models.ForeignKey(editable=False, help_text='User who uploaded the syllabus.', on_delete=django.db.models.deletion.CASCADE, related_name='uploaded_syllabi', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Syllabi',
            },
        ),
        migrations.AddIndex(
            model_name='course',
            index=models.Index(fields=['course_code'], name='courses_cou_course__897db7_idx'),
        ),
        migrations.AddIndex(
            model_name='course',
            index=models.Index(fields=['discipline'], name='courses_cou_discipl_aac634_idx'),
        ),
        migrations.AddIndex(
            model_name='syllabus',
            index=models.Index(fields=['course', 'version'], name='courses_syl_course__2a577a_idx'),
        ),
        migrations.AddIndex(
            model_name='syllabus',
            index=models.Index(fields=['uploaded_at'], name='courses_syl_uploade_b03345_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='syllabus',
            unique_together={('course', 'version')},
        ),
    ]
