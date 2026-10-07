import React from 'react';
import { Search, Plus, Shield } from 'lucide-react';
import { User } from '../../types';

interface TopBarProps {
  user: User;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  activeCategory: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenSearch,
  onOpenUpload,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/8 px-4 sm:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg glass-panel-subtle flex items-center justify-center border border-white/10 shadow-sm">
            <Shield className="w-4 h-4 text-neutral-200" strokeWidth={1.5} />
          </div>
          <span className="text-base font-display font-semibold tracking-wider text-white select-none">
            VELUM VAULT
          </span>
        </div>

        <div className="flex-1 max-w-md hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg glass-input text-xs text-neutral-400 hover:text-neutral-200 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
              <span>Search files, custom IDs, tags...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-800/80 rounded border border-white/10">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg glass-btn-secondary text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenUpload}
            className="glass-btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add File</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg glass-btn-secondary text-xs text-neutral-300 hover:text-white cursor-pointer"
            title="Vault Settings & Storage"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-700/80 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-neutral-200">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-medium max-w-[100px] truncate">
              {user.username}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
