"use client";

import { motion, AnimatePresence } from 'motion/react';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 leading-relaxed"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LoadingButton({ isLoading, disabled, children, variant = 'magic' }: {
  isLoading: boolean;
  disabled: boolean;
  children: React.ReactNode;
  variant?: 'magic' | 'emerald';
}) {
  const bgClass = variant === 'emerald'
    ? 'bg-emerald-500 text-white hover:bg-emerald-500/90 shadow-lg shadow-emerald-500/30'
    : 'bg-magic-accent text-white hover:bg-magic-accent/90 shadow-lg shadow-magic-accent/30';

  return (
    <motion.button
      type="submit"
      disabled={isLoading || disabled}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
        isLoading || disabled ? 'bg-white/10 text-white/30 cursor-not-allowed' : bgClass
      }`}
    >
      {isLoading ? (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <span className="w-4 h-4 inline-block">✨</span>
        </motion.div>
      ) : children}
    </motion.button>
  );
}
