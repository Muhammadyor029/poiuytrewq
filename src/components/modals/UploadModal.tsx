import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  UploadCloud,
  X,
  File as FileIcon,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { VaultFile } from '../../types';
import { formatBytes } from '../../utils/fileHelpers';
import { api } from '../../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (files: VaultFile[]) => void;
}

interface UploadQueueItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  customId?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [customIdInput, setCustomIdInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const newItems: UploadQueueItem[] = Array.from(filesList).map(f => ({
      file: f,
      progress: 0,
      status: 'pending',
      customId: customIdInput.trim() || undefined,
    }));
    setQueue(prev => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleStartUpload = async () => {
    if (queue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const uploadedFiles: VaultFile[] = [];
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') continue;

      setQueue(prev =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading' } : q))
      );

      try {
        const fileObj = await api.uploadFile(
          item.file,
          {
            customId: queue.length === 1 ? customIdInput.trim() || undefined : undefined,
            tags: parsedTags,
          },
          percent => {
            setQueue(prev =>
              prev.map((q, idx) => (idx === i ? { ...q, progress: percent } : q))
            );
          }
        );

        uploadedFiles.push(fileObj);
        setQueue(prev =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'completed', progress: 100 } : q
          )
        );
      } catch (err: any) {
        setQueue(prev =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: 'error',
                  errorMessage: err.message || 'Upload failed',
                }
              : q
          )
        );
      }
    }

    setIsProcessing(false);
    if (uploadedFiles.length > 0) {
      onUploadSuccess(uploadedFiles);
      setTimeout(() => {
        onClose();
        setQueue([]);
        setCustomIdInput('');
        setTagsInput('');
      }, 600);
    }
  };

  const handleRemoveQueueItem = (index: number) => {
    if (isProcessing) return;
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/12 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/8">
          <div>
            <h2 className="text-base font-display font-semibold text-white">
              Add Files to Vault
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Original files are preserved without compression or format altering.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-white/40 bg-white/10'
                : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={e => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl glass-panel-subtle flex items-center justify-center mb-3 border border-white/10">
              <UploadCloud className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-sm font-medium text-neutral-200">
              Click to select or drag and drop files
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Supports any file: images, video, audio, code, archives, documents
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Optional Custom ID
              </label>
              <input
                type="text"
                value={customIdInput}
                onChange={e => setCustomIdInput(e.target.value)}
                placeholder="e.g. project-2026, important-01"
                className="w-full glass-input rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Optional Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. research, draft, client"
                className="w-full glass-input rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-500"
              />
            </div>
          </div>

          {queue.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Selected Queue ({queue.length})</span>
                <span>
                  {formatBytes(queue.reduce((acc, q) => acc + q.file.size, 0))}
                </span>
              </div>

              <div className="divide-y divide-white/6 rounded-lg glass-panel-subtle border border-white/8 overflow-hidden max-h-48 overflow-y-auto">
                {queue.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-neutral-200 font-medium">
                          {item.file.name}
                        </div>
                        <div className="text-[11px] font-mono-tabular text-neutral-400">
                          {formatBytes(item.file.size)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'uploading' && (
                        <div className="w-20 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-white h-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {item.status === 'error' && (
                        <span
                          className="text-red-400 text-[11px] truncate max-w-[120px]"
                          title={item.errorMessage}
                        >
                          Failed
                        </span>
                      )}
                      {item.status === 'pending' && !isProcessing && (
                        <button
                          onClick={() => handleRemoveQueueItem(idx)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-white/8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg glass-btn-secondary text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStartUpload}
            disabled={queue.length === 0 || isProcessing}
            className="glass-btn-primary rounded-lg px-5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Commit to Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
