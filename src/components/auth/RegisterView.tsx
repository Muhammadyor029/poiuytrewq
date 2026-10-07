import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Lock, User as UserIcon, Phone, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface RegisterProps {
  onSuccess: (user: User) => void;
  onSwitchToSignIn: () => void;
}

export const RegisterView: React.FC<RegisterProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessAnimation, setIsSuccessAnimation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passphrases do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.register({
        username: cleanUsername,
        password,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      setIsSuccessAnimation(true);
      setTimeout(() => {
        onSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please choose another username.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[440px] mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {isSuccessAnimation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-display font-semibold text-white">Vault Created</h2>
            <p className="text-xs text-neutral-400 font-mono">Initializing private cryptographic space...</p>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-12 h-12 rounded-xl glass-panel-subtle flex items-center justify-center mb-3.5 border border-white/10 shadow-lg">
                <ShieldCheck className="w-5 h-5 text-neutral-200" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-display font-semibold tracking-tight text-white">
                Create Private Vault
              </h1>
              <p className="text-xs text-neutral-400 mt-1 font-normal">
                No email verification required. Sovereign access only.
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Username <span className="text-neutral-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    className="w-full glass-input rounded-lg pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500"
                  />
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Passphrase <span className="text-neutral-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full glass-input rounded-lg pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500"
                  />
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Confirm Passphrase <span className="text-neutral-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter passphrase"
                    className="w-full glass-input rounded-lg pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    Phone Number
                  </label>
                  <span className="text-[11px] text-neutral-500">Optional</span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full glass-input rounded-lg pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
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
                      <span>Initialize Vault</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-neutral-400">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-neutral-200 hover:text-white font-medium underline underline-offset-4 cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
