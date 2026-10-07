import React, { useState } from 'react';
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
  Tag,
  Play,
} from 'lucide-react';
import { VaultFile } from '../../types';
import { formatBytes, formatDuration, formatTimestamp } from '../../utils/fileHelpers';
import { GlassCard } from '../liquid/GlassCard';

interface FileCardProps {
  file: VaultFile;
  onOpenPreview: (file: VaultFile) => void;
  onDownload: (file: VaultFile) => void;
  onToggleFavorite: (file: VaultFile) => void;
  onMoveToTrash: (file: VaultFile) => void;
  onContextMenu: (e: React.MouseEvent, file: VaultFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onOpenPreview,
  onToggleFavorite,
  onContextMenu,
}) => {
  const [imageError, setImageError] = useState(false);

  const getCategoryIcon = () => {
    switch (file.category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-neutral-300" />;
      case 'video':
        return <Film className="w-5 h-5 text-neutral-300" />;
      case 'audio':
        return <Music className="w-5 h-5 text-neutral-300" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-neutral-300" />;
      case 'document':
        return <FileText className="w-5 h-5 text-neutral-300" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-neutral-300" />;
      default:
        return <FileQuestion className="w-5 h-5 text-neutral-300" />;
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, file);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContextMenu(e, file);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(file);
  };

  return (
    <GlassCard
      interactive
      onClick={() => onOpenPreview(file)}
      className="group flex flex-col justify-between p-3.5 h-64 select-none cursor-pointer"
    >
      <div onContextMenu={handleRightClick} className="h-full flex flex-col justify-between">
        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-900/60 border border-white/6 flex items-center justify-center">
          {file.category === 'image' && file.url && !imageError ? (
            <img
              src={file.thumbnailUrl || file.url}
              alt={file.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : file.category === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-neutral-800/40 to-neutral-950/80">
              {file.thumbnailUrl && !imageError ? (
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <Film className="w-8 h-8 text-neutral-500" />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>
              {file.metadata?.duration && (
                <span className="absolute bottom-2 right-2 text-[10px] font-mono tabular-nums text-neutral-300 bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
                  {formatDuration(file.metadata.duration)}
                </span>
              )}
            </div>
          ) : file.category === 'audio' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-800/30 to-neutral-900/60 p-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Music className="w-5 h-5 text-neutral-200" />
              </div>
              <div className="flex items-center gap-1 h-5">
                {[40, 75, 100, 60, 90, 45, 80, 50, 70, 30].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1 bg-neutral-500/60 rounded-full group-hover:bg-neutral-300 transition-colors"
                  />
                ))}
              </div>
              {file.metadata?.duration && (
                <span className="absolute bottom-2 right-2 text-[10px] font-mono tabular-nums text-neutral-400">
                  {formatDuration(file.metadata.duration)}
                </span>
              )}
            </div>
          ) : file.category === 'code' ? (
            <div className="w-full h-full flex flex-col justify-between p-3 bg-neutral-950/80 font-mono text-[11px] text-neutral-400">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 uppercase">{file.extension}</span>
                {file.metadata?.lines && (
                  <span className="text-[10px] text-neutral-600">{file.metadata.lines} lines</span>
                )}
              </div>
              <div className="line-clamp-3 text-[10px] text-neutral-500 font-mono leading-tight select-none">
                {file.textContent?.slice(0, 140) || 'import sys, os...'}
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Code2 className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-[10px]">Source code</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/40 p-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1.5">
                {getCategoryIcon()}
              </div>
              <span className="text-[11px] font-mono uppercase text-neutral-500">
                {file.extension}
              </span>
            </div>
          )}

          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={handleStarClick}
              className={`p-1.5 rounded-md backdrop-blur-md border border-white/10 transition-colors ${
                file.isFavorite
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-black/60 text-neutral-300 hover:text-white'
              }`}
              title={file.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleMoreClick}
              className="p-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white transition-colors"
              title="File Actions"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          {file.customId && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300">
              <Tag className="w-2.5 h-2.5 text-neutral-400" />
              <span>{file.customId}</span>
            </div>
          )}
        </div>

        <div className="pt-3">
          <h3
            title={file.name}
            className="text-xs font-medium text-neutral-200 truncate group-hover:text-white transition-colors"
          >
            {file.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono-tabular mt-1">
            <span>{formatBytes(file.size)}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>{formatTimestamp(file.createdAt)}</span>
            {file.tags && file.tags.length > 0 && (
              <>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-500 truncate max-w-[80px]">
                  #{file.tags[0]}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
