from rest_framework import serializers
from django.urls import reverse
from .models import User, VaultFile

class UserSerializer(serializers.ModelSerializer):
    phoneNumber = serializers.CharField(source='phone_number', required=False, allow_null=True)
    storageLimit = serializers.IntegerField(source='storage_limit', read_only=True)
    usedStorage = serializers.IntegerField(source='used_storage', read_only=True)
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'phoneNumber', 'createdAt', 'storageLimit', 'usedStorage']

class VaultFileSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    customId = serializers.CharField(source='custom_id', required=False, allow_blank=True, allow_null=True)
    originalName = serializers.CharField(source='original_name', read_only=True)
    mimeType = serializers.CharField(source='mime_type', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    deletedAt = serializers.DateTimeField(source='deleted_at', read_only=True, allow_null=True)
    isFavorite = serializers.BooleanField(source='is_favorite', required=False)
    isTrash = serializers.BooleanField(source='is_trash', required=False)
    textContent = serializers.CharField(source='text_content', read_only=True)
    url = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()

    class Meta:
        model = VaultFile
        fields = [
            'id',
            'customId',
            'name',
            'originalName',
            'size',
            'mimeType',
            'category',
            'extension',
            'createdAt',
            'updatedAt',
            'deletedAt',
            'isFavorite',
            'isTrash',
            'tags',
            'url',
            'thumbnailUrl',
            'textContent',
            'metadata',
        ]

    def get_url(self, obj):
        request = self.context.get('request')
        relative_url = reverse('file-content', kwargs={'pk': obj.id})
        if request:
            return request.build_absolute_uri(relative_url)
        return relative_url

    def get_thumbnailUrl(self, obj):
        if obj.category == 'image':
            return self.get_url(obj)
        return None
