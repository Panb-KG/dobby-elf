"use client";

/**
 * LoginPage - 家长-孩子模式登录/注册页面（编排组件）
 * 表单逻辑已拆分至 ParentLoginForm / ParentRegisterForm / ChildLoginForm
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { ParentLoginForm } from './ParentLoginForm';
import { ParentRegisterForm } from './ParentRegisterForm';
import { ChildLoginForm } from './ChildLoginForm';

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

export default function LoginPage({
  onLogin, onRegister, onChildLogin, error,
  showLogin, showRegister, onCloseLogin, onCloseRegister,
}: LoginPageProps) {
  const [page, setPage] = useState<Page>(
    showRegister ? 'parentRegister' : showLogin ? 'parentLogin' : 'welcome'
  );

  useEffect(() => {
    if (showRegister) setPage('parentRegister');
    else if (showLogin) setPage('parentLogin');
  }, [showLogin, showRegister]);

  const goBack = () => setPage('welcome');

  return (
    <div className="h-screen w-full bg-[#0a0502] flex items-center justify-center p-4 overflow-hidden">
      <div className="atmosphere" />
      {/* 漂浮的星星 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute text-magic-accent/20"
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}>
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-md relative z-10">
        {/* 标题 */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="text-center mb-8">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-magic-accent/20 border border-magic-accent/30 mb-4">
            <Wand2 className="w-10 h-10 text-magic-accent" />
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">魔法小课桌</h1>
          <p className="text-sm text-white/40 font-serif italic">Dobi&apos;s Magic Desk</p>
        </motion.div>

        {/* 卡片 */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {page === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <p className="text-center text-white/60 text-sm mb-6">你是谁呀？选一个入口吧~</p>
                <button onClick={() => setPage('parentLogin')}
                  className="w-full p-6 rounded-2xl bg-gradient-to-br from-magic-accent/20 to-magic-accent/5 border border-magic-accent/30 hover:border-magic-accent/60 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-magic-accent/20 flex items-center justify-center text-2xl">👨‍👩‍👧‍👦</div>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">我是家长</div>
                      <div className="text-white/40 text-sm">管理孩子账号，查看学习情况</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-magic-accent ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                <button onClick={() => setPage('childLogin')}
                  className="w-full p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">🧒</div>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">我是孩子</div>
                      <div className="text-white/40 text-sm">输入 PIN 码，进入魔法世界</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </motion.div>
            )}
            {page === 'parentLogin' && (
              <ParentLoginForm key="parentLogin" onLogin={onLogin} error={error}
                onBack={goBack} onSwitchToRegister={() => setPage('parentRegister')} />
            )}
            {page === 'parentRegister' && (
              <ParentRegisterForm key="parentRegister" onRegister={onRegister} error={error}
                onBack={goBack} onSwitchToLogin={() => setPage('parentLogin')} />
            )}
            {page === 'childLogin' && (
              <ChildLoginForm key="childLogin" onChildLogin={onChildLogin} onLogin={onLogin}
                error={error} onBack={goBack} />
            )}
          </AnimatePresence>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-white/20 mt-6">
          知识是唯一的魔法，而你是那个伟大的魔法师 ✨
        </motion.p>
      </motion.div>
    </div>
  );
}
