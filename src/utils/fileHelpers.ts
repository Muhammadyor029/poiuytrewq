import { FileCategory } from '../types';

export function getFileCategory(filename: string, mimeType: string): { category: FileCategory; extension: string } {
  const parts = filename.split('.');
  const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp', 'ico', 'tiff'].includes(extension)) {
    return { category: 'image', extension };
  }
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'].includes(extension)) {
    return { category: 'video', extension };
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'aiff'].includes(extension)) {
    return { category: 'audio', extension };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'].includes(extension)) {
    return { category: 'archive', extension };
  }
  if (
    ['py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'rs', 'go', 'c', 'cpp', 'java', 'rb', 'sh', 'bash', 'zsh', 'yml', 'yaml', 'toml', 'sql', 'php', 'swift', 'kt'].includes(extension) ||
    mimeType.includes('json') ||
    mimeType.includes('javascript') ||
    mimeType.includes('typescript')
  ) {
    return { category: 'code', extension };
  }
  if (
    ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'xlsx', 'xls', 'pptx', 'csv', 'epub'].includes(extension) ||
    mimeType.startsWith('text/') ||
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('spreadsheet')
  ) {
    return { category: 'document', extension };
  }

  return { category: 'other', extension: extension || 'file' };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffHours < 48 && date.getDate() === now.getDate() - 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Recently';
  }
}

export function generateId(prefix = 'file'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}
