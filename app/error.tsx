"use client";

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * ErrorBoundary - 全局错误边界
 * 
 * Next.js App Router 原生支持 error.tsx
 * 当页面组件抛出错误时自动捕获，显示友好提示
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到日志（生产环境可接入 Sentry 等）
    console.error('[ErrorBoundary] 捕获到错误:', error);
  }, [error]);

  return (
    <div className="h-screen w-full bg-[#0a0502] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* 错误图标 */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: 1 }}
          className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"
        >
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </motion.div>

        {/* 错误信息 */}
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white">
            哎呀，魔法出错了！🪄
          </h2>
          <p className="text-sm text-white/50">
            多比的魔杖好像打了个结...
          </p>
        </div>

        {/* 错误详情（开发环境） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-left">
            <p className="text-xs text-red-400 font-mono break-all">{error.message}</p>
            {error.digest && (
              <p className="text-[10px] text-white/30 font-mono mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-magic-accent text-white rounded-xl font-bold text-sm hover:bg-magic-accent/90 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            重新施法
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </div>

        {/* 提示 */}
        <p className="text-[10px] text-white/20">
          如果问题持续存在，请尝试刷新页面或联系管理员
        </p>
      </motion.div>
    </div>
  );
}
