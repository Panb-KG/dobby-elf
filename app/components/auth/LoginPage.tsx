"use client";

/**
 * LoginPage - 家长-孩子模式登录/注册页面
 *
 * 功能：
 * - 欢迎页：选择"我是家长"或"我是孩子"
 * - 家长模式：用户名+密码登录 / 家长注册
 * - 孩子模式：选择头像 + 输入PIN码登录
 * - 魔法主题 UI
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Wand2, Eye, EyeOff, Lock, User,
  ArrowRight, ArrowLeft, Shield, Star, UserCircle,
} from 'lucide-react';

// 孩子可选头像
const CHILD_AVATARS = [
  { emoji: '🧙‍♂️', name: '小魔法师' },
  { emoji: '🦊', name: '小狐狸' },
  { emoji: '🐱', name: '小猫头鹰' },
  { emoji: '🐰', name: '小兔子' },
  { emoji: '🐼', name: '小熊猫' },
  { emoji: '🦁', name: '小狮子' },
  { emoji: '🐸', name: '小青蛙' },
  { emoji: '🐧', name: '小企鹅' },
];

// 年级选项
const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, confirm: string, phone?: string, realName?: string) => Promise<void>;
  onChildLogin?: (childId: string, pin: string) => Promise<void>;
  error: string;
  showLogin: boolean;
  showRegister: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
}

type Page = 'welcome' | 'parentLogin' | 'parentRegister' | 'childLogin';

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
  onChildLogin,
  error,
  showLogin,
  showRegister,
  onCloseLogin,
  onCloseRegister,
}: LoginPageProps) {
  const [page, setPage] = useState<Page>(
    showRegister ? 'parentRegister' : showLogin ? 'parentLogin' : 'welcome'
  );

  // 家长登录
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 家长注册
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [realName, setRealName] = useState('');

  // 孩子登录
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 同步外部模式变化
  useEffect(() => {
    if (showRegister) setPage('parentRegister');
    else if (showLogin) setPage('parentLogin');
  }, [showLogin, showRegister]);

  // 切换页面时清空表单
  useEffect(() => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setRealName('');
    setPin('');
    setLocalError('');
    setSuccessMessage('');
  }, [page]);

  const passwordStrength = checkPasswordStrength(password);

  // ===== 家长登录 =====
  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim()) {
      setLocalError('请输入用户名哦！');
      return;
    }
    if (!password) {
      setLocalError('请输入密码哦！');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username.trim(), password);
      setSuccessMessage('登录成功！欢迎回来！✨');
    } catch (err: unknown) {
      const msg = (err instanceof Error && err.message) || '魔法出错了，请稍后再试~';
      setLocalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== 家长注册 =====
  const handleParentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!username.trim()) {
      setLocalError('请输入用户名哦！');
      return;
    }
    if (username.length < 2) {
      setLocalError('用户名至少需要2个字符哦！');
      return;
    }
    if (!password) {
      setLocalError('请设置密码哦！');
      return;
    }
    if (password.length < 6) {
      setLocalError('密码至少需要6个字符哦！');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一样哦，再检查一下~');
      return;
    }
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      setLocalError('请输入正确的手机号码哦！');
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(username.trim(), password, confirmPassword, phone || undefined, realName || undefined);
      setSuccessMessage('注册成功！欢迎来到魔法小课桌！🎉');
    } catch (err: unknown) {
      const msg = (err instanceof Error && err.message) || '魔法出错了，请稍后再试~';
      setLocalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== 孩子 PIN 登录 =====
  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!pin || pin.length < 4) {
      setLocalError('请输入你的 PIN 码哦！');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setLocalError('PIN 码是 4-6 位数字哦！');
      return;
    }

    // 临时方案：用头像索引作为 childId 的一部分
    // 实际使用时，应该先列出孩子账号让家长选择
    const childId = `avatar_${selectedAvatar}`;

    setIsLoading(true);
    try {
      if (onChildLogin) {
        await onChildLogin(childId, pin);
      } else {
        // 如果没有 onChildLogin 回调，回退到普通登录
        await onLogin(`child_${selectedAvatar}`, pin);
      }
      setSuccessMessage('太棒啦！欢迎来到魔法小课桌！🎉');
    } catch (err: unknown) {
      const msg = (err instanceof Error && err.message) || 'PIN 码不对哦，再试试~';
      setLocalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setPage('welcome');
    setLocalError('');
    setSuccessMessage('');
  };

  return (
    <div className="h-screen w-full bg-[#0a0502] flex items-center justify-center p-4 overflow-hidden">
      <div className="atmosphere" />

      {/* 漂浮的星星 */}
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
        {/* 标题 */}
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

        {/* 卡片 */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* ===== 欢迎页 ===== */}
            {page === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-center text-white/60 text-sm mb-6">
                  你是谁呀？选一个入口吧~
                </p>

                <button
                  onClick={() => setPage('parentLogin')}
                  className="w-full p-6 rounded-2xl bg-gradient-to-br from-magic-accent/20 to-magic-accent/5 border border-magic-accent/30 hover:border-magic-accent/60 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-magic-accent/20 flex items-center justify-center text-2xl">
                      👨‍👩‍👧‍👦
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">我是家长</div>
                      <div className="text-white/40 text-sm">管理孩子账号，查看学习情况</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-magic-accent ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => setPage('childLogin')}
                  className="w-full p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
                      🧒
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">我是孩子</div>
                      <div className="text-white/40 text-sm">输入 PIN 码，进入魔法世界</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </motion.div>
            )}

            {/* ===== 家长登录 ===== */}
            {page === 'parentLogin' && (
              <motion.form
                key="parentLogin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleParentLogin}
                className="space-y-5"
              >
                {/* 返回按钮 */}
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-magic-accent transition-colors mb-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  返回
                </button>

                <h2 className="text-xl font-bold text-white mb-4">👨‍👩‍👧‍👦 家长登录</h2>

                {/* 用户名 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="输入你的用户名"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                    maxLength={32}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>

                {/* 密码 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="输入密码"
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                      autoComplete="current-password"
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
                </div>

                {/* 错误/成功提示 */}
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

                {/* 提交 */}
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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>进入魔法世界 <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>

                {/* 注册链接 */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setPage('parentRegister')}
                    className="text-xs text-white/40 hover:text-magic-accent transition-colors"
                    disabled={isLoading}
                  >
                    还没有账号？立即注册
                  </button>
                </div>
              </motion.form>
            )}

            {/* ===== 家长注册 ===== */}
            {page === 'parentRegister' && (
              <motion.form
                key="parentRegister"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleParentRegister}
                className="space-y-5"
              >
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-magic-accent transition-colors mb-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  返回
                </button>

                <h2 className="text-xl font-bold text-white mb-4">✨ 家长注册</h2>

                {/* 用户名 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="给自己取个名字"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                    maxLength={32}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>

                {/* 真实姓名（可选） */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <UserCircle className="w-3.5 h-3.5" />
                    真实姓名 <span className="text-white/30">（选填）</span>
                  </label>
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="你的真实姓名"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                    maxLength={20}
                    disabled={isLoading}
                  />
                </div>

                {/* 手机号（可选） */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    手机号 <span className="text-white/30">（选填，用于安全验证）</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="13800138000"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                    maxLength={11}
                    disabled={isLoading}
                  />
                </div>

                {/* 密码 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少6个字符"
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all"
                      autoComplete="new-password"
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
                  {password && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          className={`h-full rounded-full transition-colors ${
                            passwordStrength.score <= 2 ? 'bg-red-400'
                              : passwordStrength.score <= 4 ? 'bg-amber-400'
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

                {/* 确认密码 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再输入一次密码"
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none transition-all ${
                      confirmPassword
                        ? confirmPassword === password
                          ? 'border-emerald-400/50 focus:border-emerald-400'
                          : 'border-red-400/50 focus:border-red-400'
                        : 'border-white/10 focus:border-magic-accent/50'
                    } focus:bg-white/10`}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-[10px] text-emerald-400">✓ 密码一致！</p>
                  )}
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[10px] text-red-400">✗ 密码不一致</p>
                  )}
                </div>

                {/* 错误/成功提示 */}
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

                <motion.button
                  type="submit"
                  disabled={isLoading || !username || !password || !confirmPassword}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isLoading || !username || !password || !confirmPassword
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-magic-accent text-white hover:bg-magic-accent/90 shadow-lg shadow-magic-accent/30'
                  }`}
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>创建家长账号 <Star className="w-4 h-4" /></>
                  )}
                </motion.button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setPage('parentLogin')}
                    className="text-xs text-white/40 hover:text-magic-accent transition-colors"
                    disabled={isLoading}
                  >
                    已有账号？立即登录
                  </button>
                </div>
              </motion.form>
            )}

            {/* ===== 孩子 PIN 登录 ===== */}
            {page === 'childLogin' && (
              <motion.form
                key="childLogin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleChildLogin}
                className="space-y-5"
              >
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-emerald-400 transition-colors mb-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  返回
                </button>

                <h2 className="text-xl font-bold text-white mb-4">🧒 孩子登录</h2>

                {/* 选择头像 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">选一个你喜欢的头像</label>
                  <div className="grid grid-cols-4 gap-3">
                    {CHILD_AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(idx)}
                        className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                          selectedAvatar === idx
                            ? 'border-emerald-400 bg-emerald-500/20 scale-110'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        {avatar.emoji}
                        <div className="text-[8px] text-white/40 mt-1">{avatar.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PIN 码 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    PIN 码
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="输入 4-6 位数字 PIN 码"
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all tracking-widest"
                      maxLength={6}
                      inputMode="numeric"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 错误/成功提示 */}
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

                <motion.button
                  type="submit"
                  disabled={isLoading || !pin}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isLoading || !pin
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-emerald-500 text-white hover:bg-emerald-500/90 shadow-lg shadow-emerald-500/30'
                  }`}
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>进入魔法世界 <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>

                <p className="text-center text-[10px] text-white/30">
                  PIN 码由家长设置，问问爸爸妈妈吧~ 🔑
                </p>
              </motion.form>
            )}
          </AnimatePresence>
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
