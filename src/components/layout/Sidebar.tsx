import React from 'react';
import {
  FolderOpen,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Archive,
  Code2,
  Star,
  Trash2,
  Settings,
  HardDrive,
  LogOut,
} from 'lucide-react';
import { formatBytes } from '../../utils/fileHelpers';
import { StorageBreakdown, User } from '../../types';

interface SidebarProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  storage: StorageBreakdown | null;
  user: User;
  onOpenSettings: () => void;
  onLogout: () => void;
  trashCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  storage,
  user,
  onOpenSettings,
  onLogout,
  trashCount = 0,
}) => {
  const mainNavItems: NavItem[] = [
    { id: 'all', label: 'All Files', icon: FolderOpen },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'code', label: 'Code & Scripts', icon: Code2 },
    { id: 'archive', label: 'Archives', icon: Archive },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2, badge: trashCount > 0 ? trashCount : undefined },
  ];

  const usedBytes = storage?.totalUsed || user.usedStorage || 0;
  const limitBytes = storage?.totalLimit || user.storageLimit || 314572800;
  const percentage = Math.min(100, Math.round((usedBytes / limitBytes) * 100));

  return (
    <aside className="w-64 h-[calc(100vh-61px)] sticky top-[61px] hidden md:flex flex-col justify-between p-4 glass-panel border-r border-white/6 select-none shrink-0 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            Vault Library
          </div>
          <nav className="space-y-0.5">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            Collections
          </div>
          <nav className="space-y-0.5">
            {secondaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono text-neutral-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-white/6 space-y-4">
        <div className="p-3 rounded-xl glass-panel-subtle border border-white/8 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
              <span>Storage</span>
            </div>
            <span className="font-mono text-[11px] text-neutral-400 tabular-nums">
              {percentage}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-neutral-400 via-neutral-200 to-white transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              style={{ width: `${Math.max(4, percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 tabular-nums">
            <span>{formatBytes(usedBytes)} used</span>
            <span>{formatBytes(limitBytes)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Sign out of vault"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
