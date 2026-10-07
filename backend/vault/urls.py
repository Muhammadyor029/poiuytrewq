from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    FileListCreateView,
    FileDetailView,
    FileFavoriteView,
    FileRestoreView,
    FilePermanentDeleteView,
    EmptyTrashView,
    StorageOverviewView,
    FileContentView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('files/', FileListCreateView.as_view(), name='file-list-create'),
    path('files/<uuid:pk>/', FileDetailView.as_view(), name='file-detail'),
    path('files/<uuid:pk>/favorite/', FileFavoriteView.as_view(), name='file-favorite'),
    path('files/<uuid:pk>/restore/', FileRestoreView.as_view(), name='file-restore'),
    path('files/<uuid:pk>/permanent/', FilePermanentDeleteView.as_view(), name='file-permanent'),
    path('files/<uuid:pk>/content/', FileContentView.as_view(), name='file-content'),
    path('trash/empty/', EmptyTrashView.as_view(), name='trash-empty'),
    path('storage/overview/', StorageOverviewView.as_view(), name='storage-overview'),
]
