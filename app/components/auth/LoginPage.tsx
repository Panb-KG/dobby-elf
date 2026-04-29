"use client";

/**
 * LoginPage - 儿童友好版登录/注册页面
 * 
 * 功能：
 * - 登录/注册模式切换（带动画）
 * - 表单验证（用户名长度、密码强度、确认密码）
 * - 密码显示/隐藏切换
 * - 儿童友好的错误提示
 * - 加载状态动画
 * - 魔法主题 UI
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Wand2, Eye, EyeOff, Lock, User,
  ArrowRight, ArrowLeft, Shield, Star,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, confirm: string) => Promise<void>;
  error: string;
  showLogin: boolean;
  showRegister: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
}

type Mode = 'login' | 'register';

// 密码强度检查
function checkPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 4) score++;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: '弱弱哒...', color: 'text-red-400' };
  if (score <= 4) return { score, label: '还可以哦！', color: 'text-amber-400' };
  return { score, label: '超强魔法密码！', color: 'text-emerald-400' };
}

export default function LoginPage({
  onLogin,
  onRegister,
  error,
  showLogin,
  showRegister,
  onCloseLogin,
  onCloseRegister,
}: LoginPageProps) {
  const [mode, setMode] = useState<Mode>(showRegister ? 'register' : 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 同步外部模式变化
  useEffect(() => {
    if (showRegister) setMode('register');
    else if (showLogin) setMode('login');
  }, [showLogin, showRegister]);

  // 切换模式时清空表单
  useEffect(() => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
    setSuccessMessage('');
  }, [mode]);

  const passwordStrength = checkPasswordStrength(password);

  const validate = (): boolean => {
    setLocalError('');
    setSuccessMessage('');

    if (!username.trim()) {
      setLocalError('哎呀，用户名不能为空哦！请告诉我你的名字~');
      return false;
    }

    if (username.length < 2) {
      setLocalError('用户名太短啦，至少需要2个字符哦！');
      return false;
    }

    if (username.length > 20) {
      setLocalError('用户名太长啦，最多20个字符~');
      return false;
    }

    if (!password) {
      setLocalError('密码不能为空哦！');
      return false;
    }

    if (password.length < 4) {
      setLocalError('密码太短啦，至少需要4个字符哦！');
      return false;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setLocalError('两次输入的密码不一样哦，再检查一下~');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(username.trim(), password);
        setSuccessMessage('呼啦啦！登录成功！多比好想你呀！✨');
      } else {
        await onRegister(username.trim(), password, confirmPassword);
        setSuccessMessage('太棒了！注册成功！欢迎来到魔法小课桌！🎉');
      }
    } catch (err: any) {
      const msg = err.message || '魔法出错了，请稍后再试~';
      setLocalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setLocalError('');
    setSuccessMessage('');
  };

  return (
    <div className="h-screen w-full bg-[#0a0502] flex items-center justify-center p-4 overflow-hidden">
      {/* 背景氛围 */}
      <div className="atmosphere" />

      {/* 漂浮的星星装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-magic-accent/20"
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-magic-accent/20 border border-magic-accent/30 mb-4"
          >
            <Wand2 className="w-10 h-10 text-magic-accent" />
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">魔法小课桌</h1>
          <p className="text-sm text-white/40 font-serif italic">Dobi&apos;s Magic Desk</p>
        </motion.div>

        {/* 登录/注册卡片 */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
          {/* 模式切换 */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setLocalError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-magic-accent text-white shadow-lg shadow-magic-accent/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              🔑 登录
            </button>
            <button
              onClick={() => { setMode('register'); setLocalError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === 'register'
                  ? 'bg-magic-accent text-white shadow-lg shadow-magic-accent/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              ✨ 注册
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 用户名 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                魔法用户名
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="给你自己取个魔法名字吧~"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                  maxLength={20}
                  autoComplete="username"
                  disabled={isLoading}
                />
                {username && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400">
                    ✓
                  </span>
                )}
              </div>
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                魔法密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置你的魔法密码（至少4位）"
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* 密码强度指示器（仅注册模式） */}
              {mode === 'register' && password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      className={`h-full rounded-full transition-colors ${
                        passwordStrength.score <= 2
                          ? 'bg-red-400'
                          : passwordStrength.score <= 4
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* 确认密码（仅注册模式） */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    确认密码
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="再输入一次密码"
                      className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none transition-all ${
                        confirmPassword
                          ? confirmPassword === password
                            ? 'border-emerald-400/50 focus:border-emerald-400'
                            : 'border-red-400/50 focus:border-red-400'
                          : 'border-white/10 focus:border-magic-accent/50'
                      } focus:bg-white/10`}
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-[10px] text-emerald-400">✓ 密码一致！</p>
                  )}
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[10px] text-red-400">✗ 密码不一致，请重新输入</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 错误提示 */}
            <AnimatePresence>
              {(localError || error) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 leading-relaxed"
                >
                  {localError || error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 成功提示 */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 提交按钮 */}
            <motion.button
              type="submit"
              disabled={isLoading || !username || !password}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isLoading || !username || !password
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-magic-accent text-white hover:bg-magic-accent/90 shadow-lg shadow-magic-accent/30'
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  正在施展魔法...
                </>
              ) : mode === 'login' ? (
                <>
                  进入魔法世界
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  创建魔法账号
                  <Star className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* 模式切换链接 */}
            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-xs text-white/40 hover:text-magic-accent transition-colors flex items-center gap-1 mx-auto"
                disabled={isLoading}
              >
                {mode === 'login' ? (
                  <>
                    <ArrowLeft className="w-3 h-3" />
                    还没有账号？立即注册
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3 h-3" />
                    已有账号？立即登录
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 底部提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-white/20 mt-6"
        >
          知识是唯一的魔法，而你是那个伟大的魔法师 ✨
        </motion.p>
      </motion.div>
    </div>
  );
}
