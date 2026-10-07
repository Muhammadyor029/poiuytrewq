import json
from django.contrib.auth import authenticate
from django.db import models
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, VaultFile
from .serializers import UserSerializer, VaultFileSerializer

MAX_FILE_SIZE = 20 * 1024 * 1024
MAX_USER_STORAGE = 300 * 1024 * 1024

def get_file_category_and_ext(filename, mime_type):
    parts = filename.split('.')
    ext = parts[-1].lower() if len(parts) > 1 else ''
    mime_type = mime_type or 'application/octet-stream'
    if mime_type.startswith('image/') or ext in ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp', 'ico', 'tiff']:
        return 'image', ext
    if mime_type.startswith('video/') or ext in ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v']:
        return 'video', ext
    if mime_type.startswith('audio/') or ext in ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'aiff']:
        return 'audio', ext
    if ext in ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso']:
        return 'archive', ext
    if ext in ['py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'rs', 'go', 'c', 'cpp', 'java', 'rb', 'sh', 'bash', 'zsh', 'yml', 'yaml', 'toml', 'sql', 'php', 'swift', 'kt'] or 'json' in mime_type or 'javascript' in mime_type or 'typescript' in mime_type:
        return 'code', ext
    if ext in ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'xlsx', 'xls', 'pptx', 'csv', 'epub'] or mime_type.startswith('text/') or 'pdf' in mime_type or 'word' in mime_type or 'spreadsheet' in mime_type:
        return 'document', ext
    return 'other', ext or 'file'

def seed_demo_data(user):
    if user.vault_files.exists():
        return
    sample_files = [
        {
            'custom_id': 'arch-spec-2026',
            'name': 'quantum_resilience_architecture.pdf',
            'original_name': 'quantum_resilience_architecture.pdf',
            'mime_type': 'application/pdf',
            'category': 'document',
            'extension': 'pdf',
            'is_favorite': True,
            'tags': ['security', 'cryptography', 'spec'],
            'text_content': 'Quantum Resilience Architecture\nVersion 4.2.0 • Confidential',
            'data': b'%PDF-1.4\n1 0 obj\n<< /Title (Quantum Resilience Architecture) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
        },
        {
            'custom_id': 'core-pipeline',
            'name': 'neural_latent_sampler.py',
            'original_name': 'neural_latent_sampler.py',
            'mime_type': 'text/x-python',
            'category': 'code',
            'extension': 'py',
            'is_favorite': True,
            'tags': ['python', 'ml', 'pipeline'],
            'text_content': 'import numpy as np\nimport torch\n\nprint("Velum Projector Initialized")\n',
            'data': b'import numpy as np\nimport torch\n\nprint("Velum Projector Initialized")\n',
        },
        {
            'custom_id': 'infra-env-2026',
            'name': 'production_cluster.config.json',
            'original_name': 'production_cluster.config.json',
            'mime_type': 'application/json',
            'category': 'code',
            'extension': 'json',
            'is_favorite': False,
            'tags': ['json', 'config'],
            'text_content': '{\n  "vaultCluster": "node-primary-sg1",\n  "cipher": "ChaCha20-Poly1305"\n}',
            'data': b'{\n  "vaultCluster": "node-primary-sg1",\n  "cipher": "ChaCha20-Poly1305"\n}',
        },
    ]
    for item in sample_files:
        payload = item['data']
        VaultFile.objects.create(
            user=user,
            custom_id=item['custom_id'],
            name=item['name'],
            original_name=item['original_name'],
            size=len(payload),
            mime_type=item['mime_type'],
            category=item['category'],
            extension=item['extension'],
            is_favorite=item['is_favorite'],
            tags=item['tags'],
            text_content=item.get('text_content'),
            data=payload,
            metadata={'checksum': 'sha256-demo'}
        )

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        phone_number = request.data.get('phoneNumber') or request.data.get('phone_number')

        if not username or len(username) < 3:
            return Response({'message': 'Username must be at least 3 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        if username.lower() in ('sovereign', 'demo'):
            return Response({'message': 'This username cannot be registered.'}, status=status.HTTP_400_BAD_REQUEST)

        if not password or len(password) < 6:
            return Response({'message': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username__iexact=username).exists():
            return Response({'message': 'Username is already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            phone_number=phone_number.strip() if phone_number else None,
            storage_limit=MAX_USER_STORAGE
        )
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if username.lower() in ('sovereign', 'demo') and password == 'vaultpass2026':
            user = User.objects.filter(username__iexact='sovereign').first()
            if not user:
                user = User.objects.create_user(
                    username='sovereign',
                    password='vaultpass2026',
                    phone_number='+1 (555) 234-8901',
                    storage_limit=MAX_USER_STORAGE
                )
                seed_demo_data(user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            })

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'message': 'Invalid username or vault passphrase.'}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'success': True})

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class FileListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category')
        search_query = request.query_params.get('searchQuery', '').strip()
        custom_id_query = request.query_params.get('customIdQuery', '').strip()
        extension = request.query_params.get('extension')
        sort_by = request.query_params.get('sortBy', 'date_desc')

        qs = VaultFile.objects.defer('data').filter(user=request.user)

        if category == 'trash':
            qs = qs.filter(is_trash=True)
        elif category == 'favorites':
            qs = qs.filter(is_trash=False, is_favorite=True)
        elif category and category != 'all':
            qs = qs.filter(is_trash=False, category=category)
        else:
            qs = qs.filter(is_trash=False)

        if search_query:
            qs = qs.filter(
                models.Q(name__icontains=search_query) |
                models.Q(custom_id__icontains=search_query) |
                models.Q(extension__icontains=search_query)
            )

        if custom_id_query:
            qs = qs.filter(custom_id__icontains=custom_id_query)

        if extension and extension != 'all':
            qs = qs.filter(extension__iexact=extension)

        sort_map = {
            'date_desc': '-created_at',
            'date_asc': 'created_at',
            'name_asc': 'name',
            'name_desc': '-name',
            'size_desc': '-size',
            'size_asc': 'size',
        }
        qs = qs.order_by(sort_map.get(sort_by, '-created_at'))

        serializer = VaultFileSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'message': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        if uploaded_file.size > MAX_FILE_SIZE:
            return Response({'message': 'File size exceeds 20 MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.used_storage + uploaded_file.size > request.user.storage_limit:
            return Response({'message': 'Insufficient vault storage capacity (300 MB limit).'}, status=status.HTTP_400_BAD_REQUEST)

        custom_id = request.data.get('customId', '').strip()
        if custom_id:
            if VaultFile.objects.filter(user=request.user, custom_id__iexact=custom_id).exists():
                return Response({'message': f'Custom ID "{custom_id}" is already assigned.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            custom_id = None

        tags_raw = request.data.get('tags', '')
        if isinstance(tags_raw, str):
            try:
                tags = json.loads(tags_raw) if tags_raw.startswith('[') else [t.strip() for t in tags_raw.split(',') if t.strip()]
            except (json.JSONDecodeError, ValueError):
                tags = [t.strip() for t in tags_raw.split(',') if t.strip()]
        elif isinstance(tags_raw, list):
            tags = tags_raw
        else:
            tags = []

        file_bytes = uploaded_file.read()
        category, extension = get_file_category_and_ext(uploaded_file.name, uploaded_file.content_type)

        text_content = None
        if category in ('code', 'document') or (uploaded_file.content_type and uploaded_file.content_type.startswith('text/')):
            try:
                text_content = file_bytes.decode('utf-8')[:50000]
            except UnicodeDecodeError:
                text_content = None

        metadata = {}
        if text_content:
            metadata['lines'] = len(text_content.splitlines())

        vault_file = VaultFile.objects.create(
            user=request.user,
            custom_id=custom_id,
            name=uploaded_file.name,
            original_name=uploaded_file.name,
            size=uploaded_file.size,
            mime_type=uploaded_file.content_type or 'application/octet-stream',
            category=category,
            extension=extension,
            tags=tags,
            data=file_bytes,
            text_content=text_content,
            metadata=metadata
        )

        serializer = VaultFileSerializer(vault_file, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            file_obj = VaultFile.objects.defer('data').get(pk=pk, user=request.user)
        except VaultFile.DoesNotExist:
            return Response({'message': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = VaultFileSerializer(file_obj, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            file_obj = VaultFile.objects.defer('data').get(pk=pk, user=request.user)
        except VaultFile.DoesNotExist:
            return Response({'message': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data:
            name = request.data['name'].strip()
            if name:
                file_obj.name = name
                category, ext = get_file_category_and_ext(name, file_obj.mime_type)
                file_obj.category = category
                file_obj.extension = ext

        if 'customId' in request.data:
            custom_id = request.data['customId']
            if custom_id is not None:
                custom_id = str(custom_id).strip()
            if custom_id:
                if VaultFile.objects.filter(user=request.user, custom_id__iexact=custom_id).exclude(pk=pk).exists():
                    return Response({'message': f'Custom ID "{custom_id}" already assigned.'}, status=status.HTTP_400_BAD_REQUEST)
                file_obj.custom_id = custom_id
            else:
                file_obj.custom_id = None

        if 'tags' in request.data:
            tags = request.data['tags']
            file_obj.tags = tags if isinstance(tags, list) else []

        if 'isFavorite' in request.data:
            file_obj.is_favorite = bool(request.data['isFavorite'])

        file_obj.save()
        serializer = VaultFileSerializer(file_obj, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            file_obj = VaultFile.objects.defer('data').get(pk=pk, user=request.user)
        except VaultFile.DoesNotExist:
            return Response({'message': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        file_obj.is_trash = True
        file_obj.deleted_at = timezone.now()
        file_obj.save()
        return Response({'success': True})

class FileFavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            file_obj = VaultFile.objects.defer('data').get(pk=pk, user=request.user)
        except VaultFile.DoesNotExist:
            return Response({'message': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        file_obj.is_favorite = not file_obj.is_favorite
        file_obj.save()
        serializer = VaultFileSerializer(file_obj, context={'request': request})
        return Response(serializer.data)

class FileRestoreView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            file_obj = VaultFile.objects.defer('data').get(pk=pk, user=request.user)
        except VaultFile.DoesNotExist:
            return Response({'message': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        file_obj.is_trash = False
        file_obj.deleted_at = None
        file_obj.save()
        serializer = VaultFileSerializer(file_obj, context={'request': request})
        return Response(serializer.data)

class FilePermanentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            file_obj = VaultFile.objects.defer('data').get(pk=pk, user=request.user)
        except VaultFile.DoesNotExist:
            return Response({'message': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        file_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class EmptyTrashView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        request.user.vault_files.filter(is_trash=True).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class StorageOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        files = request.user.vault_files.filter(is_trash=False)
        by_category = {
            'image': 0,
            'video': 0,
            'audio': 0,
            'document': 0,
            'archive': 0,
            'code': 0,
            'other': 0,
        }
        total_used = 0
        for f in files:
            cat = f.category if f.category in by_category else 'other'
            by_category[cat] += f.size
            total_used += f.size

        return Response({
            'totalLimit': request.user.storage_limit,
            'totalUsed': total_used,
            'byCategory': by_category,
            'fileCount': files.count()
        })

class FileContentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            file_obj = VaultFile.objects.get(pk=pk)
        except VaultFile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(bytes(file_obj.data), content_type=file_obj.mime_type)
        disposition = 'attachment' if request.query_params.get('download') == 'true' else 'inline'
        response['Content-Disposition'] = f'{disposition}; filename="{file_obj.original_name}"'
        response['Content-Length'] = file_obj.size
        return response
