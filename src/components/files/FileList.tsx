import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Code2,
  FileQuestion,
  Star,
  MoreVertical,
  Download,
} from 'lucide-react';
import { VaultFile } from '../../types';
import { formatBytes, formatTimestamp } from '../../utils/fileHelpers';

interface FileListProps {
  files: VaultFile[];
  onOpenPreview: (file: VaultFile) => void;
  onDownload: (file: VaultFile) => void;
  onToggleFavorite: (file: VaultFile) => void;
  onMoveToTrash: (file: VaultFile) => void;
  onContextMenu: (e: React.MouseEvent, file: VaultFile) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onOpenPreview,
  onDownload,
  onToggleFavorite,
  onContextMenu,
}) => {
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
        return <FileQuestion className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="w-full glass-panel rounded-xl overflow-hidden border border-white/8 select-none">
      <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-white/[0.02] border-b border-white/6 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
        <div className="col-span-6 md:col-span-5">Name</div>
        <div className="hidden md:block md:col-span-2">Custom ID</div>
        <div className="col-span-3 md:col-span-2 text-right">Size</div>
        <div className="hidden sm:block sm:col-span-2 text-right">Added</div>
        <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
      </div>

      <div className="divide-y divide-white/4 text-xs text-neutral-200">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => onOpenPreview(file)}
            onContextMenu={e => {
              e.preventDefault();
              onContextMenu(e, file);
            }}
            className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onToggleFavorite(file);
                }}
                className="text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    file.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                  }`}
                />
              </button>

              <div className="w-7 h-7 rounded-lg bg-neutral-900/80 border border-white/8 flex items-center justify-center shrink-0">
                {getIcon(file.category)}
              </div>

              <span className="truncate font-medium text-neutral-200 group-hover:text-white">
                {file.name}
              </span>
            </div>

            <div className="hidden md:block md:col-span-2 min-w-0">
              {file.customId ? (
                <span className="text-[11px] font-mono text-neutral-400 truncate block">
                  {file.customId}
                </span>
              ) : (
                <span className="text-neutral-600">—</span>
              )}
            </div>

            <div className="col-span-3 md:col-span-2 text-right font-mono-tabular text-neutral-400 text-[11px]">
              {formatBytes(file.size)}
            </div>

            <div className="hidden sm:block sm:col-span-2 text-right font-mono-tabular text-neutral-400 text-[11px]">
              {formatTimestamp(file.createdAt)}
            </div>

            <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDownload(file);
                }}
                className="p-1 text-neutral-400 hover:text-white transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  onContextMenu(e, file);
                }}
                className="p-1 text-neutral-400 hover:text-white transition-colors"
                title="More"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
