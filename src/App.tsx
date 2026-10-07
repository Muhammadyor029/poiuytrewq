import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { api } from './services/api';
import { FilterOptions, StorageBreakdown, User, VaultFile } from './types';
import { formatBytes } from './utils/fileHelpers';
import { LiquidCanvas } from './components/liquid/LiquidCanvas';
import { SignInView } from './components/auth/SignInView';
import { RegisterView } from './components/auth/RegisterView';
import { FirstEntryExperience } from './components/onboarding/FirstEntryExperience';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { FileCard } from './components/files/FileCard';
import { FileList } from './components/files/FileList';
import { FilterBar } from './components/files/FilterBar';
import { EmptyState } from './components/files/EmptyState';
import { FileContextMenu } from './components/files/FileContextMenu';
import { UploadModal } from './components/modals/UploadModal';
import { FilePreviewModal } from './components/modals/FilePreviewModal';
import { SearchCommandModal } from './components/modals/SearchCommandModal';
import { EditFileModal } from './components/modals/EditFileModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ToastContainer, ToastMessage } from './components/ui/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'signin' | 'register'>('signin');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [files, setFiles] = useState<VaultFile[]>([]);
  const [storage, setStorage] = useState<StorageBreakdown | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    searchQuery: '',
    sortBy: 'date_desc',
  });

  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [fileToEdit, setFileToEdit] = useState<VaultFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    file: VaultFile;
    position: { x: number; y: number };
  } | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getMe();
        if (user) {
          setCurrentUser(user);
        }
      } catch {
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const loadVaultData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [fetchedFiles, storageInfo] = await Promise.all([
        api.getFiles({ ...filters, category: currentCategory }),
        api.getStorageOverview(),
      ]);
      setFiles(fetchedFiles);
      setStorage(storageInfo);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load vault items');
    }
  }, [currentUser, currentCategory, filters]);

  useEffect(() => {
    if (currentUser && !isOnboarding) {
      loadVaultData();
    }
  }, [currentUser, currentCategory, filters, isOnboarding, loadVaultData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAuthSuccess = (user: User, wasNewRegistration = false) => {
    setCurrentUser(user);
    if (wasNewRegistration) {
      setIsOnboarding(true);
    } else {
      addToast('success', `Welcome back, ${user.username}`);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setFiles([]);
    setStorage(null);
    setPreviewFile(null);
    setIsSettingsOpen(false);
    addToast('info', 'Vault session secured and locked.');
  };

  const handleDownload = (file: VaultFile) => {
    try {
      if (file.url) {
        const a = document.createElement('a');
        const downloadUrl = file.url.includes('?')
          ? `${file.url}&download=true`
          : `${file.url}?download=true`;
        a.href = downloadUrl;
        a.download = file.originalName || file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (file.textContent) {
        const blob = new Blob([file.textContent], { type: file.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName || file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      addToast('success', `Downloaded ${file.name}`);
    } catch {
      addToast('error', 'Unable to download file.');
    }
  };

  const handleToggleFavorite = async (file: VaultFile) => {
    try {
      const updated = await api.toggleFavorite(file.id);
      setFiles(prev => prev.map(f => (f.id === file.id ? updated : f)));
      if (previewFile?.id === file.id) setPreviewFile(updated);
      addToast(
        'success',
        updated.isFavorite ? `Starred ${file.name}` : `Unstarred ${file.name}`
      );
    } catch {
      addToast('error', 'Failed to update favorite status.');
    }
  };

  const handleMoveToTrash = async (file: VaultFile) => {
    try {
      await api.moveToTrash(file.id);
      loadVaultData();
      addToast('info', `Moved ${file.name} to Trash.`);
    } catch {
      addToast('error', 'Failed to move file to trash.');
    }
  };

  const handleRestore = async (file: VaultFile) => {
    try {
      await api.restoreFile(file.id);
      loadVaultData();
      addToast('success', `Restored ${file.name} to vault.`);
    } catch {
      addToast('error', 'Failed to restore file.');
    }
  };

  const handleDeletePermanent = async (file: VaultFile) => {
    try {
      await api.deletePermanent(file.id);
      loadVaultData();
      addToast('info', `Permanently erased ${file.name}.`);
    } catch {
      addToast('error', 'Failed to delete file.');
    }
  };

  const handleSaveFileEdits = async (
    id: string,
    updates: { name: string; customId?: string; tags?: string[] }
  ) => {
    const updated = await api.updateFile(id, updates);
    setFiles(prev => prev.map(f => (f.id === id ? updated : f)));
    if (previewFile?.id === id) setPreviewFile(updated);
    addToast('success', 'File properties saved.');
  };

  const handleUploadSuccess = (uploaded: VaultFile[]) => {
    loadVaultData();
    addToast('success', `Uploaded ${uploaded.length} ${uploaded.length === 1 ? 'file' : 'files'}.`);
  };

  const availableExtensions = useMemo(() => {
    const exts = new Set<string>();
    files.forEach(f => {
      if (f.extension) exts.add(f.extension);
    });
    return Array.from(exts).sort();
  }, [files]);

  const totalBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + f.size, 0);
  }, [files]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#07080b]">
        <LiquidCanvas />
        <AnimatePresence mode="wait">
          {authView === 'signin' ? (
            <SignInView
              key="signin"
              onSuccess={u => handleAuthSuccess(u, false)}
              onSwitchToRegister={() => setAuthView('register')}
            />
          ) : (
            <RegisterView
              key="register"
              onSuccess={u => handleAuthSuccess(u, true)}
              onSwitchToSignIn={() => setAuthView('signin')}
            />
          )}
        </AnimatePresence>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <>
        <LiquidCanvas />
        <FirstEntryExperience
          username={currentUser.username}
          onComplete={() => {
            setIsOnboarding(false);
            loadVaultData();
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-neutral-100 flex flex-col relative selection:bg-neutral-700/60 selection:text-white">
      <LiquidCanvas />

      <TopBar
        user={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        activeCategory={currentCategory}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar
          currentCategory={currentCategory}
          onSelectCategory={cat => {
            setCurrentCategory(cat);
            setFilters(prev => ({ ...prev, category: cat }));
          }}
          storage={storage}
          user={currentUser}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
          trashCount={storage ? undefined : undefined}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-8 pb-24 md:pb-12 overflow-y-auto">
          <FilterBar
            filters={filters}
            onChangeFilters={updates => setFilters(prev => ({ ...prev, ...updates }))}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            totalCount={files.length}
            totalBytesFormatted={formatBytes(totalBytes)}
            categoryTitle={
              currentCategory === 'all'
                ? 'All Files'
                : currentCategory === 'favorites'
                ? 'Starred Files'
                : currentCategory === 'trash'
                ? 'Trash'
                : currentCategory
            }
            availableExtensions={availableExtensions}
          />

          {files.length === 0 ? (
            <EmptyState
              category={currentCategory}
              onOpenUpload={() => setIsUploadOpen(true)}
              isTrash={currentCategory === 'trash'}
              isFavorite={currentCategory === 'favorites'}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  onOpenPreview={setPreviewFile}
                  onDownload={handleDownload}
                  onToggleFavorite={handleToggleFavorite}
                  onMoveToTrash={handleMoveToTrash}
                  onContextMenu={(e, f) => {
                    setContextMenu({
                      file: f,
                      position: { x: e.clientX, y: e.clientY },
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <FileList
              files={files}
              onOpenPreview={setPreviewFile}
              onDownload={handleDownload}
              onToggleFavorite={handleToggleFavorite}
              onMoveToTrash={handleMoveToTrash}
              onContextMenu={(e, f) => {
                setContextMenu({
                  file: f,
                  position: { x: e.clientX, y: e.clientY },
                });
              }}
            />
          )}
        </main>
      </div>

      <MobileNav
        currentCategory={currentCategory}
        onSelectCategory={cat => {
          setCurrentCategory(cat);
          setFilters(prev => ({ ...prev, category: cat }));
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        storage={storage}
        user={currentUser}
      />

      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onOpenPreview={f => {
            setContextMenu(null);
            setPreviewFile(f);
          }}
          onDownload={f => {
            setContextMenu(null);
            handleDownload(f);
          }}
          onRename={f => {
            setContextMenu(null);
            setFileToEdit(f);
          }}
          onEditCustomId={f => {
            setContextMenu(null);
            setFileToEdit(f);
          }}
          onToggleFavorite={f => {
            setContextMenu(null);
            handleToggleFavorite(f);
          }}
          onMoveToTrash={f => {
            setContextMenu(null);
            handleMoveToTrash(f);
          }}
          onRestore={f => {
            setContextMenu(null);
            handleRestore(f);
          }}
          onDeletePermanent={f => {
            setContextMenu(null);
            handleDeletePermanent(f);
          }}
        />
      )}

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            key="upload-modal"
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {previewFile && (
          <FilePreviewModal
            key="preview-modal"
            file={previewFile}
            onClose={() => setPreviewFile(null)}
            onDownload={handleDownload}
            onToggleFavorite={handleToggleFavorite}
            onMoveToTrash={handleMoveToTrash}
            onEditCustomId={f => {
              setPreviewFile(null);
              setFileToEdit(f);
            }}
            onRename={f => {
              setPreviewFile(null);
              setFileToEdit(f);
            }}
          />
        )}

        {isSearchOpen && (
          <SearchCommandModal
            key="search-modal"
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            files={files}
            onSelectFile={setPreviewFile}
          />
        )}

        {fileToEdit && (
          <EditFileModal
            key="edit-modal"
            file={fileToEdit}
            isOpen={Boolean(fileToEdit)}
            onClose={() => setFileToEdit(null)}
            onSave={handleSaveFileEdits}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            key="settings-modal"
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            user={currentUser}
            storage={storage}
            onLogout={handleLogout}
            onReloadFiles={loadVaultData}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
