import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Tag, Edit3, Check, AlertCircle } from 'lucide-react';
import { VaultFile } from '../../types';

interface EditFileModalProps {
  file: VaultFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { name: string; customId?: string; tags?: string[] }) => Promise<void>;
}

export const EditFileModal: React.FC<EditFileModalProps> = ({
  file,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [customId, setCustomId] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setCustomId(file.customId || '');
      setTags(file.tags ? file.tags.join(', ') : '');
      setError(null);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Filename cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await onSave(file.id, {
        name: name.trim(),
        customId: customId.trim() || undefined,
        tags: parsedTags,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update file properties.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-white/12 flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <Edit3 className="w-4 h-4 text-neutral-300" />
            <h2 className="text-sm font-display font-semibold text-white">
              Edit File Properties
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/25 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-300 mb-1.5">
              File Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full glass-input rounded-lg px-3 py-2 text-neutral-100 font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-neutral-300">
                Custom Identifier
              </label>
              <span className="text-[11px] text-neutral-500">Optional</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={customId}
                onChange={e => setCustomId(e.target.value)}
                placeholder="e.g. project-2026, invoice-october"
                className="w-full glass-input rounded-lg pl-8 pr-3 py-2 text-neutral-100 font-mono"
              />
              <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Used for instant command lookup via Cmd + K.
            </p>
          </div>

          <div>
            <label className="block font-medium text-neutral-300 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="confidential, code, spec"
              className="w-full glass-input rounded-lg px-3 py-2 text-neutral-100"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg glass-btn-secondary font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="glass-btn-primary rounded-lg px-5 py-2 font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
