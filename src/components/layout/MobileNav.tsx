import React, { useState } from 'react';
import { FolderOpen, Star, Plus, Trash2, Menu, X, Image as ImageIcon, Film, Music, FileText, Code2, Settings, LogOut } from 'lucide-react';
import { StorageBreakdown, User } from '../../types';

interface MobileNavProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  storage: StorageBreakdown | null;
  user: User;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenUpload,
  onOpenSettings,
  onLogout,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Files', icon: FolderOpen },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'code', label: 'Code & Scripts', icon: Code2 },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const handleSelect = (id: string) => {
    onSelectCategory(id);
    setDrawerOpen(false);
  };

  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-md flex flex-col justify-end">
          <div className="glass-panel rounded-t-2xl p-6 border-t border-white/10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/8">
              <span className="text-sm font-display font-semibold text-white">Vault Navigation</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {categories.map(c => {
                const Icon = c.icon;
                const isActive = currentCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/15'
                        : 'glass-panel-subtle text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/8 flex items-center justify-between">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-2 text-xs text-neutral-300"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-2 text-xs text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden glass-panel border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentCategory === 'all' ? 'text-white' : 'text-neutral-400'
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          <span>Files</span>
        </button>

        <button
          onClick={() => onSelectCategory('favorites')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentCategory === 'favorites' ? 'text-white' : 'text-neutral-400'
          }`}
        >
          <Star className="w-5 h-5" />
          <span>Starred</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="w-10 h-10 -mt-4 rounded-full glass-btn-primary flex items-center justify-center shadow-xl cursor-pointer"
          aria-label="Add file"
        >
          <Plus className="w-5 h-5 text-neutral-900" />
        </button>

        <button
          onClick={() => onSelectCategory('trash')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentCategory === 'trash' ? 'text-white' : 'text-neutral-400'
          }`}
        >
          <Trash2 className="w-5 h-5" />
          <span>Trash</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[10px] text-neutral-400"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
