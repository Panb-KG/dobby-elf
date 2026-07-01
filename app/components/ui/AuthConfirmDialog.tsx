'use client';

import React from 'react';

interface AuthConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onLogin: () => void;
  onCancel: () => void;
}

/**
 * 认证确认对话框
 * 
 * 当访客尝试访问需要登录的功能时显示
 * 提供"取消"和"去登录"两个选项
 */
export default function AuthConfirmDialog({
  isOpen,
  title,
  message,
  onLogin,
  onCancel,
}: AuthConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* 对话框 */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-orange-500/30 animate-in fade-in zoom-in duration-200">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-orange-500/20">
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        
        {/* 内容区 */}
        <div className="px-6 py-5">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>
        
        {/* 按钮区 */}
        <div className="px-6 py-4 border-t border-orange-500/20 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg font-medium transition-colors duration-200"
          >
            取消
          </button>
          <button
            onClick={onLogin}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-orange-500/25"
          >
            🔐 去登录
          </button>
        </div>
      </div>
    </div>
  );
}
