from rest_framework import serializers
from .models import Course, Syllabus, CourseCategory, CourseType, CBCSCategory, User

class ChoiceSerializer(serializers.Serializer):
    """Serializer for Enum choices."""
    value = serializers.CharField(source='name')
    label = serializers.CharField()

    def to_representation(self, instance):
        return {'value': instance[0], 'label': instance[1]}

class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model CRUD operations."""
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'course_code', 'course_name', 'course_category', 'type', 'cbcs_category',
            'maximum_credit', 'discipline', 'created_by', 'created_at', 'updated_by',
            'updated_at', 'is_deleted'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_by', 'updated_at']

    def create(self, validated_data):
        """Set created_by from the request user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        validated_data['created_by'] = request.user
        return Course.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Set updated_by from the request user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        instance.course_name = validated_data.get('course_name', instance.course_name)
        instance.course_category = validated_data.get('course_category', instance.course_category)
        instance.type = validated_data.get('type', instance.type)
        instance.cbcs_category = validated_data.get('cbcs_category', instance.cbcs_category)
        instance.maximum_credit = validated_data.get('maximum_credit', instance.maximum_credit)
        instance.discipline = validated_data.get('discipline', instance.discipline)
        instance.updated_by = request.user
        instance.save()
        return instance

class SyllabusSerializer(serializers.ModelSerializer):
    """Serializer for Syllabus model CRUD operations."""
    uploaded_by = serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())  # Use course_code

    class Meta:
        model = Syllabus
        fields = [
            'id', 'course', 'course_name', 'syllabus_file', 'uploaded_by', 'uploaded_at',
            'updated_by', 'updated_at', 'description', 'version', 'is_deleted'
        ]
        read_only_fields = ['course_name', 'uploaded_by', 'uploaded_at', 'updated_by', 'updated_at']

    def create(self, validated_data):
        """Set uploaded_by from the request user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        validated_data['uploaded_by'] = request.user
        return Syllabus.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Set updated_by from the request user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        instance.syllabus_file = validated_data.get('syllabus_file', instance.syllabus_file)
        instance.description = validated_data.get('description', instance.description)
        instance.version = validated_data.get('version', instance.version)
        instance.updated_by = request.user
        instance.save()
        return instance