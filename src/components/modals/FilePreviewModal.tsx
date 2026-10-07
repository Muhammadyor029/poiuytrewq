import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Download,
  Star,
  Trash2,
  Tag,
  Edit3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  Volume2,
  FileText,
  Archive,
  Copy,
  Check,
} from 'lucide-react';
import { VaultFile } from '../../types';
import { formatBytes, formatDuration, formatTimestamp } from '../../utils/fileHelpers';

interface FilePreviewModalProps {
  file: VaultFile | null;
  onClose: () => void;
  onDownload: (file: VaultFile) => void;
  onToggleFavorite: (file: VaultFile) => void;
  onMoveToTrash: (file: VaultFile) => void;
  onEditCustomId: (file: VaultFile) => void;
  onRename: (file: VaultFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onDownload,
  onToggleFavorite,
  onMoveToTrash,
  onEditCustomId,
  onRename,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(file?.metadata?.duration || 0);
  const [isCopied, setIsCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setZoomLevel(1);
    setIsPlayingAudio(false);
    setAudioCurrentTime(0);
  }, [file]);

  if (!file) return null;

  const handleCopyText = () => {
    if (file.textContent) {
      navigator.clipboard.writeText(file.textContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl h-[88vh] glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/12"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <h2 className="text-sm font-semibold text-neutral-100 truncate max-w-md">
              {file.name}
            </h2>
            {file.customId && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-neutral-300 bg-white/5 border border-white/10">
                <Tag className="w-3 h-3 text-neutral-400" />
                {file.customId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onToggleFavorite(file)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                file.isFavorite
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'glass-btn-secondary text-neutral-400 hover:text-white'
              }`}
              title={file.isFavorite ? 'Remove from Favorites' : 'Mark as Favorite'}
            >
              <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => onEditCustomId(file)}
              className="p-2 rounded-lg glass-btn-secondary text-neutral-400 hover:text-white cursor-pointer"
              title="Assign or Edit Custom ID"
            >
              <Tag className="w-4 h-4" />
            </button>

            <button
              onClick={() => onRename(file)}
              className="p-2 rounded-lg glass-btn-secondary text-neutral-400 hover:text-white cursor-pointer"
              title="Rename File"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDownload(file)}
              className="glass-btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Download Original File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => {
                onMoveToTrash(file);
                onClose();
              }}
              className="p-2 rounded-lg glass-btn-secondary text-red-400 hover:bg-red-500/15 cursor-pointer"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative overflow-hidden bg-neutral-950/60 flex items-center justify-center p-4">
          {file.category === 'image' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center overflow-auto">
              <div
                className="transition-transform duration-200 ease-out flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={file.url}
                  alt={file.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[62vh] max-w-[85vw] object-contain rounded-lg shadow-2xl select-none"
                />
              </div>

              <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/10 shadow-xl text-xs text-neutral-300">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1 hover:text-white cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] tabular-nums px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                    className="p-1 hover:text-white cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 hover:text-white cursor-pointer border-l border-white/10 pl-2"
                    title="Reset to 100%"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {file.category === 'video' && (
            <div className="w-full max-w-4xl h-full flex items-center justify-center">
              <video
                src={file.url}
                controls
                autoPlay
                playsInline
                className="max-h-[70vh] w-full rounded-xl shadow-2xl bg-black border border-white/10"
              />
            </div>
          )}

          {file.category === 'audio' && (
            <div className="w-full max-w-lg glass-panel rounded-2xl p-8 border border-white/10 flex flex-col items-center text-center shadow-2xl">
              <audio
                ref={audioRef}
                src={file.url}
                onTimeUpdate={e => setAudioCurrentTime((e.target as HTMLAudioElement).currentTime)}
                onLoadedMetadata={e => setAudioDuration((e.target as HTMLAudioElement).duration || 0)}
                onEnded={() => setIsPlayingAudio(false)}
              />

              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
                <Volume2 className="w-8 h-8 text-neutral-200" />
              </div>

              <h3 className="text-base font-medium text-white mb-1 truncate max-w-full">
                {file.name}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mb-6">
                Lossless Vault Audio Stream
              </p>

              <div className="w-full flex items-center justify-center gap-1.5 h-16 mb-6">
                {[30, 60, 95, 45, 80, 100, 70, 50, 90, 40, 85, 60, 75, 40, 95, 50].map((val, i) => (
                  <motion.div
                    key={i}
                    animate={
                      isPlayingAudio
                        ? { height: [`${val * 0.3}%`, `${val}%`, `${val * 0.4}%`] }
                        : { height: `${val * 0.3}%` }
                    }
                    transition={{
                      duration: 0.6 + (i % 4) * 0.1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 bg-neutral-300 rounded-full"
                  />
                ))}
              </div>

              <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 mb-4 tabular-nums">
                <span>{formatDuration(audioCurrentTime)}</span>
                <span>{formatDuration(audioDuration || file.metadata?.duration || 0)}</span>
              </div>

              <button
                onClick={toggleAudioPlay}
                className="w-14 h-14 rounded-full glass-btn-primary flex items-center justify-center shadow-2xl cursor-pointer"
              >
                {isPlayingAudio ? (
                  <Pause className="w-6 h-6 text-neutral-900" />
                ) : (
                  <Play className="w-6 h-6 text-neutral-900 fill-neutral-900 ml-1" />
                )}
              </button>
            </div>
          )}

          {file.category === 'code' && (
            <div className="w-full h-full flex flex-col glass-panel-subtle rounded-xl overflow-hidden border border-white/8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/6 bg-neutral-900/60 text-xs font-mono text-neutral-400">
                <span>{file.extension.toUpperCase()} Source</span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-white cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-neutral-200 leading-relaxed bg-[#0a0c10]">
                <pre className="whitespace-pre">
                  <code>{file.textContent || 'No textual content available for preview.'}</code>
                </pre>
              </div>
            </div>
          )}

          {(file.category === 'document' || file.category === 'archive' || file.category === 'other') && (
            <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 flex flex-col items-center text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {file.category === 'archive' ? (
                  <Archive className="w-8 h-8 text-neutral-300" />
                ) : (
                  <FileText className="w-8 h-8 text-neutral-300" />
                )}
              </div>
              <h3 className="text-base font-semibold text-white mb-1 truncate max-w-full">
                {file.name}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                Format: .{file.extension} · {formatBytes(file.size)}
              </p>

              {file.textContent ? (
                <div className="w-full max-h-48 overflow-y-auto p-3 text-left font-mono text-xs text-neutral-300 bg-black/40 rounded-lg border border-white/6 mb-5 whitespace-pre-wrap">
                  {file.textContent}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                  This file is stored in its pristine, bit-exact format and ready for direct local download.
                </p>
              )}

              <button
                onClick={() => onDownload(file)}
                className="glass-btn-primary rounded-xl px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Original ({formatBytes(file.size)})</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/8 shrink-0 bg-white/[0.01] flex items-center justify-between text-xs text-neutral-400 font-mono-tabular">
          <div className="flex items-center gap-3">
            <span>Size: {formatBytes(file.size)}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>MIME: {file.mimeType}</span>
            {file.metadata?.checksum && (
              <>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="hidden sm:inline">Digest: {file.metadata.checksum}</span>
              </>
            )}
          </div>
          <div>
            <span>Added {formatTimestamp(file.createdAt)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
