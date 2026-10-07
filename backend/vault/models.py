import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    storage_limit = models.BigIntegerField(default=314572800)

    @property
    def used_storage(self):
        total = self.vault_files.aggregate(total=models.Sum('size'))['total']
        return total or 0

class VaultFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vault_files')
    custom_id = models.CharField(max_length=120, blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    size = models.BigIntegerField()
    mime_type = models.CharField(max_length=150, default='application/octet-stream')
    category = models.CharField(max_length=50, default='other')
    extension = models.CharField(max_length=40, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_favorite = models.BooleanField(default=False)
    is_trash = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    data = models.BinaryField()
    text_content = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
