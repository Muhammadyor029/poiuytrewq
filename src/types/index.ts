export type FileCategory = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'archive' 
  | 'code' 
  | 'other';

export interface VaultFile {
  id: string;
  customId?: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  extension: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isFavorite: boolean;
  isTrash: boolean;
  tags: string[];
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    lines?: number;
    checksum?: string;
  };
  textContent?: string;
}

export interface User {
  id: string;
  username: string;
  phoneNumber?: string;
  createdAt: string;
  storageLimit: number;
  usedStorage: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type SortOption = 
  | 'date_desc' 
  | 'date_asc' 
  | 'name_asc' 
  | 'name_desc' 
  | 'size_desc' 
  | 'size_asc';

export interface FilterOptions {
  category: string;
  searchQuery: string;
  customIdQuery?: string;
  extension?: string;
  sortBy: SortOption;
  sizeFilter?: 'all' | 'under10mb' | '10mb_to_100mb' | 'over100mb';
}

export interface StorageBreakdown {
  totalLimit: number;
  totalUsed: number;
  byCategory: Record<FileCategory, number>;
  fileCount: number;
}
