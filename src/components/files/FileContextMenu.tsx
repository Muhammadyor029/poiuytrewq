import React, { useEffect, useRef } from 'react';
import { Eye, Download, Edit3, Tag, Star, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { VaultFile } from '../../types';

interface FileContextMenuProps {
  file: VaultFile;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenPreview: (file: VaultFile) => void;
  onDownload: (file: VaultFile) => void;
  onRename: (file: VaultFile) => void;
  onEditCustomId: (file: VaultFile) => void;
  onToggleFavorite: (file: VaultFile) => void;
  onMoveToTrash: (file: VaultFile) => void;
  onRestore: (file: VaultFile) => void;
  onDeletePermanent: (file: VaultFile) => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  file,
  position,
  onClose,
  onOpenPreview,
  onDownload,
  onRename,
  onEditCustomId,
  onToggleFavorite,
  onMoveToTrash,
  onRestore,
  onDeletePermanent,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const adjustedX = Math.min(position.x, window.innerWidth - 220);
  const adjustedY = Math.min(position.y, window.innerHeight - 280);

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-52 glass-panel rounded-xl py-1.5 shadow-2xl border border-white/12 text-xs text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {!file.isTrash ? (
        <>
          <button
            onClick={() => {
              onClose();
              onOpenPreview(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            <span>Open Preview</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDownload(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Download Original</span>
          </button>

          <div className="my-1 border-t border-white/6" />

          <button
            onClick={() => {
              onClose();
              onToggleFavorite(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-neutral-400'}`} />
            <span>{file.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onEditCustomId(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-neutral-400" />
            <span>Assign Custom ID</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onRename(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Rename File</span>
          </button>

          <div className="my-1 border-t border-white/6" />

          <button
            onClick={() => {
              onClose();
              onMoveToTrash(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Move to Trash</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              onClose();
              onRestore(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-emerald-300 hover:bg-emerald-500/15 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore File</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDeletePermanent(file);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Delete Permanently</span>
          </button>
        </>
      )}
    </div>
  );
};
