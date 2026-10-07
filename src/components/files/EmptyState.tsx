import React from 'react';
import { motion } from 'motion/react';
import { Plus, ShieldCheck, Inbox } from 'lucide-react';

interface EmptyStateProps {
  category: string;
  onOpenUpload: () => void;
  isTrash?: boolean;
  isFavorite?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenUpload,
  isTrash,
  isFavorite,
}) => {
  const getEmptyCopy = () => {
    if (isTrash) {
      return {
        title: 'Trash is empty',
        subtitle: 'No deleted items found in this vault partition.',
        cta: null,
      };
    }
    if (isFavorite) {
      return {
        title: 'No favorite items yet',
        subtitle: 'Star important files, scripts, and media for immediate access.',
        cta: null,
      };
    }
    return {
      title: 'Nothing here yet.',
      subtitle: 'Your private space is ready.',
      cta: 'Add your first file',
    };
  };

  const copy = getEmptyCopy();

  return (
    <div className="relative min-h-[380px] w-full flex flex-col items-center justify-center p-8 text-center select-none">
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-72 h-72 rounded-full blur-[100px] bg-gradient-to-tr from-neutral-500/20 to-slate-400/10 pointer-events-none"
      />

      <div className="relative z-10 max-w-sm flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl glass-panel-subtle flex items-center justify-center mb-5 border border-white/10 shadow-xl">
          {isTrash ? (
            <Inbox className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
          ) : (
            <ShieldCheck className="w-6 h-6 text-neutral-300" strokeWidth={1.5} />
          )}
        </div>

        <h3 className="text-xl font-display font-medium text-neutral-100 tracking-tight">
          {copy.title}
        </h3>

        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-normal">
          {copy.subtitle}
        </p>

        {copy.cta && (
          <div className="mt-6">
            <button
              onClick={onOpenUpload}
              className="glass-btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{copy.cta}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
