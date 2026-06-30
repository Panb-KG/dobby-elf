"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { ErrorMessage, SuccessMessage, LoadingButton } from './AuthMessages';

interface ParentLoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string;
  onBack: () => void;
  onSwitchToRegister: () => void;
}

export function ParentLoginForm({ onLogin, error, onBack, onSwitchToRegister }: ParentLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!username.trim()) { setLocalError('请输入用户名哦！'); return; }
    if (!password) { setLocalError('请输入密码哦！'); return; }
    setIsLoading(true);
    try {
      await onLogin(username.trim(), password);
      setSuccessMessage('登录成功！欢迎回来！✨');
    } catch (err: unknown) {
      setLocalError((err instanceof Error && err.message) || '魔法出错了，请稍后再试~');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      key="parentLogin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit} className="space-y-5"
    >
      <button type="button" onClick={onBack}
        className="flex items-center gap-1 text-xs text-white/40 hover:text-magic-accent transition-colors mb-2">
        <ArrowLeft className="w-3 h-3" /> 返回
      </button>
      <h2 className="text-xl font-bold text-white mb-4">👨‍👩‍👧‍👦 家长登录</h2>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><User className="w-3.5 h-3.5" />用户名</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="输入你的用户名"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
          maxLength={32} autoComplete="username" disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><Lock className="w-3.5 h-3.5" />密码</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码"
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
            autoComplete="current-password" disabled={isLoading} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors" disabled={isLoading}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <ErrorMessage message={localError || error} />
      <SuccessMessage message={successMessage} />
      <LoadingButton isLoading={isLoading} disabled={!username || !password}>
        进入魔法世界 <ArrowRight className="w-4 h-4" />
      </LoadingButton>
      <div className="text-center">
        <button type="button" onClick={onSwitchToRegister}
          className="text-xs text-white/40 hover:text-magic-accent transition-colors" disabled={isLoading}>
          还没有账号？立即注册
        </button>
      </div>
    </motion.form>
  );
}
