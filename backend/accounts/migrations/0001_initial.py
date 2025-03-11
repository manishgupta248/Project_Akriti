# Generated by Django 5.1.7 on 2025-03-09 14:11

import accounts.models
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('email', models.EmailField(db_index=True, help_text='Enter a valid email address.', max_length=255, unique=True, verbose_name='Email Address')),
                ('first_name', models.CharField(db_index=True, max_length=50, verbose_name='First Name')),
                ('last_name', models.CharField(db_index=True, max_length=50, verbose_name='Last Name')),
                ('mobile_number', models.CharField(blank=True, help_text='Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9.', max_length=10, null=True, validators=[django.core.validators.RegexValidator(message='Enter a valid Indian mobile number (10 digits, starting with 6-9).', regex='^[6-9]\\d{9}$')], verbose_name='Mobile Number')),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('profile_picture', models.ImageField(blank=True, null=True, upload_to=accounts.models.CustomUser.user_profile_pic_path, verbose_name='Profile Picture')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'User',
                'verbose_name_plural': 'Users',
                'ordering': ['email'],
                'indexes': [models.Index(fields=['first_name', 'last_name'], name='name_idx')],
            },
        ),
    ]
