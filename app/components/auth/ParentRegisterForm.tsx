"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, User, Shield, UserCircle, Star, ArrowLeft } from 'lucide-react';
import { ErrorMessage, SuccessMessage, LoadingButton } from './AuthMessages';
import { checkPasswordStrength } from './auth-utils';

interface ParentRegisterFormProps {
  onRegister: (username: string, password: string, confirm: string, phone?: string, realName?: string) => Promise<void>;
  error: string;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export function ParentRegisterForm({ onRegister, error, onBack, onSwitchToLogin }: ParentRegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [realName, setRealName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordStrength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(''); setSuccessMessage('');
    if (!username.trim() || username.length < 2) { setLocalError('用户名至少需要2个字符哦！'); return; }
    if (!password || password.length < 6) { setLocalError('密码至少需要6个字符哦！'); return; }
    if (password !== confirmPassword) { setLocalError('两次输入的密码不一样哦，再检查一下~'); return; }
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) { setLocalError('请输入正确的手机号码哦！'); return; }
    setIsLoading(true);
    try {
      await onRegister(username.trim(), password, confirmPassword, phone || undefined, realName || undefined);
      setSuccessMessage('注册成功！欢迎来到魔法小课桌！🎉');
    } catch (err: unknown) {
      setLocalError((err instanceof Error && err.message) || '魔法出错了，请稍后再试~');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      key="parentRegister" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit} className="space-y-5"
    >
      <button type="button" onClick={onBack}
        className="flex items-center gap-1 text-xs text-white/40 hover:text-magic-accent transition-colors mb-2">
        <ArrowLeft className="w-3 h-3" /> 返回
      </button>
      <h2 className="text-xl font-bold text-white mb-4">✨ 家长注册</h2>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><User className="w-3.5 h-3.5" />用户名</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="给自己取个名字"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
          maxLength={32} autoComplete="username" disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><UserCircle className="w-3.5 h-3.5" />真实姓名 <span className="text-white/30">（选填）</span></label>
        <input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} placeholder="你的真实姓名"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
          maxLength={20} disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><Shield className="w-3.5 h-3.5" />手机号 <span className="text-white/30">（选填）</span></label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="13800138000"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
          maxLength={11} disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><Lock className="w-3.5 h-3.5" />密码</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少6个字符"
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
            autoComplete="new-password" disabled={isLoading} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors" disabled={isLoading}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                className={`h-full rounded-full ${passwordStrength.score <= 2 ? 'bg-red-400' : passwordStrength.score <= 4 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </div>
            <span className={`text-[10px] font-bold ${passwordStrength.color}`}>{passwordStrength.label}</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/60 flex items-center gap-2"><Shield className="w-3.5 h-3.5" />确认密码</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再输入一次密码"
          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none transition-all ${
            confirmPassword ? (confirmPassword === password ? 'border-emerald-400/50 focus:border-emerald-400' : 'border-red-400/50 focus:border-red-400')
            : 'border-white/10 focus:border-magic-accent/50'} focus:bg-white/10`}
          autoComplete="new-password" disabled={isLoading} />
        {confirmPassword && confirmPassword === password && <p className="text-[10px] text-emerald-400">✓ 密码一致！</p>}
        {confirmPassword && confirmPassword !== password && <p className="text-[10px] text-red-400">✗ 密码不一致</p>}
      </div>
      <ErrorMessage message={localError || error} />
      <SuccessMessage message={successMessage} />
      <LoadingButton isLoading={isLoading} disabled={!username || !password || !confirmPassword}>
        创建家长账号 <Star className="w-4 h-4" />
      </LoadingButton>
      <div className="text-center">
        <button type="button" onClick={onSwitchToLogin}
          className="text-xs text-white/40 hover:text-magic-accent transition-colors" disabled={isLoading}>
          已有账号？立即登录
        </button>
      </div>
    </motion.form>
  );
}
