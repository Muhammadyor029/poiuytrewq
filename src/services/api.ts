import { AuthResponse, FilterOptions, StorageBreakdown, User, VaultFile } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'velum_vault_auth_token';
const USER_KEY = 'velum_vault_active_user';

class VaultApiService {
  private activeToken: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    try {
      this.activeToken = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    } catch {
      this.activeToken = null;
      this.currentUser = null;
    }
  }

  private getHeaders(isJson = true): Record<string, string> {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.activeToken) {
      headers['Authorization'] = `Token ${this.activeToken}`;
    }
    return headers;
  }

  async register(payload: {
    username: string;
    password: string;
    phoneNumber?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
        phoneNumber: payload.phoneNumber || '',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed.' }));
      throw new Error(err.message || 'Registration failed.');
    }

    const data: AuthResponse = await res.json();
    this.activeToken = data.token;
    this.currentUser = data.user;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  }

  async login(payload: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Invalid credentials.' }));
      throw new Error(err.message || 'Invalid username or passphrase.');
    }

    const data: AuthResponse = await res.json();
    this.activeToken = data.token;
    this.currentUser = data.user;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  }

  async logout(): Promise<void> {
    try {
      if (this.activeToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: this.getHeaders(true),
        });
      }
    } finally {
      this.activeToken = null;
      this.currentUser = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  async getMe(): Promise<User | null> {
    if (!this.activeToken) {
      return null;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
        headers: this.getHeaders(true),
      });

      if (!res.ok) {
        this.activeToken = null;
        this.currentUser = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }

      const user: User = await res.json();
      this.currentUser = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return this.currentUser;
    }
  }

  async getFiles(filters?: Partial<FilterOptions>): Promise<VaultFile[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.searchQuery) params.set('searchQuery', filters.searchQuery);
    if (filters?.customIdQuery) params.set('customIdQuery', filters.customIdQuery);
    if (filters?.extension) params.set('extension', filters.extension);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/files/${queryStr}`, {
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch files.' }));
      throw new Error(err.message || 'Failed to fetch files.');
    }

    return await res.json();
  }

  async getFile(id: string): Promise<VaultFile> {
    const res = await fetch(`${API_BASE_URL}/api/files/${id}/`, {
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      throw new Error('File not found.');
    }

    return await res.json();
  }

  uploadFile(
    file: File,
    options?: {
      customId?: string;
      tags?: string[];
    },
    onProgress?: (percent: number) => void
  ): Promise<VaultFile> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append('file', file);
      if (options?.customId) {
        formData.append('customId', options.customId);
      }
      if (options?.tags && options.tags.length > 0) {
        formData.append('tags', JSON.stringify(options.tags));
      }

      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: VaultFile = JSON.parse(xhr.responseText);
            if (onProgress) onProgress(100);
            resolve(data);
          } catch {
            reject(new Error('Invalid response from vault server.'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.message || 'Upload failed.'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}.`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during file upload.'));
      };

      xhr.open('POST', `${API_BASE_URL}/api/files/`);
      if (this.activeToken) {
        xhr.setRequestHeader('Authorization', `Token ${this.activeToken}`);
      }
      xhr.send(formData);
    });
  }

  async updateFile(
    id: string,
    updates: {
      name?: string;
      customId?: string;
      tags?: string[];
      isFavorite?: boolean;
    }
  ): Promise<VaultFile> {
    const res = await fetch(`${API_BASE_URL}/api/files/${id}/`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Update failed.' }));
      throw new Error(err.message || 'Update failed.');
    }

    return await res.json();
  }

  async toggleFavorite(id: string): Promise<VaultFile> {
    const res = await fetch(`${API_BASE_URL}/api/files/${id}/favorite/`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to update favorite status.');
    }

    return await res.json();
  }

  async moveToTrash(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/files/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to move file to trash.');
    }
  }

  async restoreFile(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/files/${id}/restore/`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to restore file.');
    }
  }

  async deletePermanent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/files/${id}/permanent/`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to delete file.');
    }
  }

  async emptyTrash(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/trash/empty/`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to empty trash.');
    }
  }

  async getStorageOverview(): Promise<StorageBreakdown> {
    const res = await fetch(`${API_BASE_URL}/api/storage/overview/`, {
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      return {
        totalLimit: 314572800,
        totalUsed: 0,
        byCategory: {
          image: 0,
          video: 0,
          audio: 0,
          document: 0,
          archive: 0,
          code: 0,
          other: 0,
        },
        fileCount: 0,
      };
    }

    return await res.json();
  }
}

export const api = new VaultApiService();
