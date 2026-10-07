import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Code2,
  Star,
  CornerDownLeft,
} from 'lucide-react';
import { VaultFile } from '../../types';
import { formatBytes } from '../../utils/fileHelpers';

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
}

export const SearchCommandModal: React.FC<SearchCommandModalProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredFiles = files.filter(f => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      f.name.toLowerCase().includes(q) ||
      (f.customId && f.customId.toLowerCase().includes(q)) ||
      f.category.toLowerCase().includes(q) ||
      f.extension.toLowerCase().includes(q) ||
      f.tags.some(t => t.toLowerCase().includes(q))
    );
  }).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredFiles.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredFiles.length) % Math.max(1, filteredFiles.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFiles[selectedIndex]) {
        onSelectFile(filteredFiles[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-neutral-400" />;
      case 'video':
        return <Film className="w-4 h-4 text-neutral-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-neutral-400" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-neutral-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-neutral-400" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-neutral-400" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/12 flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 bg-white/[0.02]">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search by file name, custom ID, type, extension, or tag..."
            className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-800/80 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredFiles.length > 0 ? (
            <div className="space-y-0.5">
              {filteredFiles.map((file, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      onSelectFile(file);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-white/12 text-white shadow-sm border border-white/10'
                        : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900/80 border border-white/8 flex items-center justify-center shrink-0">
                        {getIcon(file.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate text-neutral-100">
                            {file.name}
                          </span>
                          {file.isFavorite && (
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono-tabular text-neutral-400 mt-0.5">
                          {file.customId && (
                            <>
                              <span className="text-neutral-300 font-mono">id: {file.customId}</span>
                              <span aria-hidden="true" className="text-neutral-600">·</span>
                            </>
                          )}
                          <span>{formatBytes(file.size)}</span>
                          <span aria-hidden="true" className="text-neutral-600">·</span>
                          <span className="capitalize">{file.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                          <span>Open</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              No matching files or IDs found for &quot;{query}&quot;
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/6 bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>{filteredFiles.length} {filteredFiles.length === 1 ? 'match' : 'matches'}</span>
        </div>
      </motion.div>
    </div>
  );
};
