import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Lock, User as UserIcon, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface SignInProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

export const SignInView: React.FC<SignInProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and passphrase.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.login({ username, password });
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.login({ username: 'sovereign', password: 'vaultpass2026' });
      onSuccess(res.user);
    } catch {
      try {
        const reg = await api.register({
          username: 'sovereign',
          password: 'vaultpass2026',
          phoneNumber: '+1 (555) 234-8901',
        });
        onSuccess(reg.user);
      } catch (err: any) {
        setErrorMessage(err.message || 'Demo access error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px] mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl glass-panel-subtle flex items-center justify-center mb-4 border border-white/10 shadow-lg">
            <Lock className="w-5 h-5 text-neutral-200" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-white">
            Velum Vault
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5 font-normal">
            Private Sovereign Storage
          </p>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-200"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter vault username"
                className="w-full glass-input rounded-lg pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500"
              />
              <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Passphrase
            </label>
            <div className="relative">
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input rounded-lg pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500"
              />
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full glass-btn-primary rounded-lg py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full glass-btn-secondary rounded-lg py-2 px-3 text-xs font-medium text-neutral-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>Instant Demo Vault Access</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-neutral-400">
          <span>Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-neutral-200 hover:text-white font-medium underline underline-offset-4 cursor-pointer transition-colors"
          >
            Create Vault
          </button>
        </div>
      </motion.div>
    </div>
  );
};
