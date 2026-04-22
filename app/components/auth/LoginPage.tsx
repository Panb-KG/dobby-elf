"use client";

import React from 'react';
import { motion } from 'motion/react';

interface LoginPageProps {
  showLogin: boolean;
  showRegister: boolean;
  error: string;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string, confirm: string) => void;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
}

export default function LoginPage({
  showLogin,
  showRegister,
  error,
  onLogin,
  onRegister,
  onCloseLogin,
  onCloseRegister,
}: LoginPageProps) {
  return (
    <div className="h-screen w-full bg-[#0a0502] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 max-w-md w-full rounded-2xl"
      >
        <h1 className="text-3xl font-serif text-white text-center mb-2">魔法小课桌</h1>
        <p className="text-white/40 text-center mb-8">你的学习小魔灵多比</p>
        
        <div className="text-center text-white/60">
          登录功能待完善
        </div>
      </motion.div>
    </div>
  );
}
