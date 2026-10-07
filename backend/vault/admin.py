from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, VaultFile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'phone_number', 'storage_limit', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        (None, {'fields': ('phone_number', 'storage_limit')}),
    )

@admin.register(VaultFile)
class VaultFileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'size', 'custom_id', 'is_favorite', 'is_trash', 'created_at')
    list_filter = ('category', 'is_favorite', 'is_trash')
    search_fields = ('name', 'custom_id', 'user__username')
