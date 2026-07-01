'use client';

import React from 'react';

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: DialogType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

/**
 * 通用确认对话框组件
 * 
 * 用于替代原生 alert() 和 confirm()，提供更美观的用户体验
 * 支持多种类型：信息、成功、警告、错误、确认
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  showCancel = true,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  // 根据类型设置样式
  const typeConfig = {
    info: {
      icon: 'ℹ️',
      borderColor: 'border-blue-500/30',
      buttonBg: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/25',
    },
    success: {
      icon: '✅',
      borderColor: 'border-green-500/30',
      buttonBg: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/25',
    },
    warning: {
      icon: '⚠️',
      borderColor: 'border-orange-500/30',
      buttonBg: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25',
    },
    error: {
      icon: '❌',
      borderColor: 'border-red-500/30',
      buttonBg: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-500/25',
    },
    confirm: {
      icon: '🔐',
      borderColor: 'border-orange-500/30',
      buttonBg: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25',
    },
  };

  const config = typeConfig[type];
  const displayTitle = title || `${config.icon} ${type === 'confirm' ? '需要登录' : '提示'}`;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={showCancel ? handleCancel : undefined}
      />
      
      {/* 对话框 */}
      <div className={`relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border ${config.borderColor} animate-in fade-in zoom-in duration-200`}>
        {/* 标题栏 */}
        <div className={`px-6 py-4 border-b ${config.borderColor}`}>
          <h3 className="text-lg font-bold text-white">{displayTitle}</h3>
        </div>
        
        {/* 内容区 */}
        <div className="px-6 py-5">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>
        
        {/* 按钮区 */}
        <div className={`px-6 py-4 border-t ${config.borderColor} flex gap-3`}>
          {showCancel && (
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg font-medium transition-colors duration-200"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 ${config.buttonBg} text-white rounded-lg font-medium transition-all duration-200 shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
