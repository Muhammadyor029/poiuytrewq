import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  User as UserIcon,
  Trash2,
  Download,
  Shield,
  Smartphone,
  Calendar,
  LogOut,
} from 'lucide-react';
import { StorageBreakdown, User } from '../../types';
import { formatBytes, formatTimestamp } from '../../utils/fileHelpers';
import { api } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  storage: StorageBreakdown | null;
  onLogout: () => void;
  onReloadFiles: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  storage,
  onLogout,
  onReloadFiles,
}) => {
  const [isClearingTrash, setIsClearingTrash] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const usedBytes = storage?.totalUsed || 0;
  const limitBytes = storage?.totalLimit || 314572800;
  const percentage = Math.min(100, Math.round((usedBytes / limitBytes) * 100));

  const handleEmptyTrash = async () => {
    try {
      setIsClearingTrash(true);
      await api.emptyTrash();
      onReloadFiles();
      setFeedback('Trash permanently emptied.');
      setTimeout(() => setFeedback(null), 2500);
    } catch {
      setFeedback('Failed to empty trash.');
    } finally {
      setIsClearingTrash(false);
    }
  };

  const handleExportManifest = () => {
    const manifest = {
      vaultOwner: user.username,
      exportedAt: new Date().toISOString(),
      storageOverview: storage,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velum_vault_manifest_${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/12 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-neutral-300" strokeWidth={1.5} />
            <h2 className="text-base font-display font-semibold text-white">
              Vault Overview & Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs text-center">
            {feedback}
          </div>
        )}

        <div className="space-y-6">
          <div className="p-4 rounded-xl glass-panel-subtle border border-white/8 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
              Identity & Keyholder
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-neutral-300">
                <UserIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="font-medium text-white">{user.username}</span>
              </div>

              {user.phoneNumber ? (
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <Smartphone className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="font-mono">{user.phoneNumber}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-neutral-500">
                  <Smartphone className="w-4 h-4 text-neutral-600 shrink-0" />
                  <span>No recovery phone bound</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-neutral-400 sm:col-span-2">
                <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Initialized on {formatTimestamp(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel-subtle border border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Encrypted Storage Allocation
              </span>
              <span className="text-xs font-mono text-neutral-300 tabular-nums">
                {percentage}% used
              </span>
            </div>

            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/6">
              <div
                className="h-full bg-gradient-to-r from-neutral-400 via-neutral-200 to-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                style={{ width: `${Math.max(4, percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono-tabular text-neutral-400">
              <span>{formatBytes(usedBytes)} used</span>
              <span>{formatBytes(limitBytes)} limit</span>
            </div>

            {storage?.byCategory && (
              <div className="pt-2 border-t border-white/6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(storage.byCategory).map(([cat, bytes]) => (
                  <div key={cat} className="p-2 rounded-lg bg-white/[0.02]">
                    <div className="capitalize text-neutral-400 text-[11px]">{cat}</div>
                    <div className="font-mono text-neutral-200 font-medium mt-0.5">
                      {formatBytes(bytes)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block px-1">
              Vault Operations
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleExportManifest}
                className="p-3 rounded-xl glass-btn-secondary flex items-center justify-between hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-neutral-400" />
                  <span>Export Manifest</span>
                </div>
              </button>

              <button
                onClick={handleEmptyTrash}
                disabled={isClearingTrash}
                className="p-3 rounded-xl glass-btn-secondary text-red-300 hover:bg-red-500/15 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Empty Trash</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-white/8 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock & Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="glass-btn-primary rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
