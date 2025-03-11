from rest_framework import serializers
from .models import Department, Faculty, User

class FacultyChoiceSerializer(serializers.Serializer):
    """Serializer for Faculty Enum choices."""
    value = serializers.CharField()
    label = serializers.CharField()

    def to_representation(self, instance):
        return {'value': instance[0], 'label': instance[1]}

class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model CRUD operations."""
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'faculty', 'created_by', 'created_at',
            'updated_by', 'updated_at', 'is_deleted'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_by', 'updated_at']

    def create(self, validated_data):
        """Custom create method to use the DepartmentManager."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        return Department.objects.create_department(
            name=validated_data['name'],
            faculty=validated_data['faculty'],
            created_by=request.user
        )

    def update(self, instance, validated_data):
        """Custom update method to set updated_by."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        instance.name = validated_data.get('name', instance.name)
        instance.faculty = validated_data.get('faculty', instance.faculty)
        instance.updated_by = request.user
        instance.save()
        return instance