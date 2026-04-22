"use client";

import React from 'react';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full bg-[#0a0502] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex gap-2 justify-center">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-3 h-3 bg-magic-accent rounded-full"
          />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-3 h-3 bg-magic-accent rounded-full"
          />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-3 h-3 bg-magic-accent rounded-full"
          />
        </div>
        <p className="text-white/40 text-sm">多比正在准备魔法...</p>
      </motion.div>
    </div>
  );
}
