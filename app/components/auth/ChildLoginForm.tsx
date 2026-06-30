"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { ErrorMessage, SuccessMessage, LoadingButton } from './AuthMessages';
import { CHILD_AVATARS } from './auth-utils';

interface ChildLoginFormProps {
  onChildLogin?: (childId: string, pin: string) => Promise<void>;
  onLogin: (username: string, password: string) => Promise<void>;
  error: string;
  onBack: () => void;
}

export function ChildLoginForm({ onChildLogin, onLogin, error, onBack }: ChildLoginFormProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!pin || pin.length < 4) { setLocalError('请输入你的 PIN 码哦！'); return; }
    if (!/^\d{4,6}$/.test(pin)) { setLocalError('PIN 码是 4-6 位数字哦！'); return; }
    const childId = `avatar_${selectedAvatar}`;
    setIsLoading(true);
    try {
      if (onChildLogin) { await onChildLogin(childId, pin); }
      else { await onLogin(`child_${selectedAvatar}`, pin); }
      setSuccessMessage('太棒啦！欢迎来到魔法小课桌！🎉');
    } catch (err: unknown) {
      setLocalError((err instanceof Error && err.message) || 'PIN 码不对哦，再试试~');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      key="childLogin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit} className="space-y-5"
    >
      <button type="button" onClick={onBack}
        className="flex items-center gap-1 text-xs text-white/40 hover:text-emerald-400 transition-colors mb-2">
        <ArrowLeft className="w-3 h-3" /> 返回
      </button>
      <h2 className="text-xl font-bold text-white mb-4">🧒 孩子登录</h2>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60">选一个你喜欢的头像</label>
        <div className="grid grid-cols-4 gap-3">
          {CHILD_AVATARS.map((avatar, idx) => (
            <button key={idx} type="button" onClick={() => setSelectedAvatar(idx)}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                selectedAvatar === idx ? 'border-emerald-400 bg-emerald-500/20 scale-110' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
              {avatar.emoji}
              <div className="text-[8px] text-white/40 mt-1">{avatar.name}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><Lock className="w-3.5 h-3.5" />PIN 码</label>
        <div className="relative">
          <input type={showPin ? 'text' : 'password'} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="输入 4-6 位数字 PIN 码"
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all tracking-widest"
            maxLength={6} inputMode="numeric" disabled={isLoading} />
          <button type="button" onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors" disabled={isLoading}>
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <ErrorMessage message={localError || error} />
      <SuccessMessage message={successMessage} />
      <LoadingButton isLoading={isLoading} disabled={!pin} variant="emerald">
        进入魔法世界 <ArrowRight className="w-4 h-4" />
      </LoadingButton>
      <p className="text-center text-[10px] text-white/30">PIN 码由家长设置，问问爸爸妈妈吧~ 🔑</p>
    </motion.form>
  );
}
