import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface FirstEntryProps {
  onComplete: () => void;
  username: string;
}

const PHRASES = [
  'Your personal space.',
  'Your files.',
  'Your memories.',
  'Your documents.',
  'Your music.',
  'Your data.',
  'Everything in one place.',
];

export const FirstEntryExperience: React.FC<FirstEntryProps> = ({ onComplete, username }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < PHRASES.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#07080b]/90 backdrop-blur-2xl select-none"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-96 h-96 rounded-full blur-[120px] bg-gradient-to-tr from-neutral-600/30 to-slate-400/20 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center mb-10 shadow-2xl border border-white/10"
        >
          <ShieldCheck className="w-5 h-5 text-neutral-200" strokeWidth={1.5} />
        </motion.div>

        <div className="h-20 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentIndex}
              initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl font-display font-medium tracking-tight text-neutral-100"
            >
              {PHRASES[currentIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-4 text-xs font-mono tracking-widest uppercase text-neutral-400"
        >
          Vault initialized for {username}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <button
            onClick={onComplete}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-neutral-300 hover:text-white glass-panel-subtle hover:border-white/20 transition-all duration-200"
          >
            <span>Enter Vault</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
