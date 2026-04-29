"use client";

import React from 'react';
import { LogOut, Bell, PanelRightClose, PanelRightOpen, History } from 'lucide-react';
import type { User } from '../../types';
import { DobiAvatar } from '../DobiAvatar';

interface HeaderProps {
  user: User;
  points: number;
  level: string;
  onLogout: () => void;
  onRightSidebarToggle?: () => void;
  isRightSidebarOpen?: boolean;
}

export default function Header({ user, points, level, onLogout, onRightSidebarToggle, isRightSidebarOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 z-10">
      <div className="flex items-center gap-4">
        <DobiAvatar size="md" />
        <div>
          <h1 className="text-xl font-serif font-bold tracking-wide text-white">魔法小课桌</h1>
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-magic-accent font-bold">Dobi&apos;s Magic Desk</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* 右侧边栏切换 */}
        {onRightSidebarToggle && (
          <button
            onClick={onRightSidebarToggle}
            className={`p-2 rounded-full transition-all ${
              isRightSidebarOpen ? "bg-magic-accent/20 text-magic-accent" : "hover:bg-white/5 text-white/60"
            }`}
            title={isRightSidebarOpen ? "关闭展示栏" : "打开展示栏"}
          >
            {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        )}
        
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <History className="w-5 h-5 text-white/60" />
        </button>
        
        {/* 用户信息 */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-medium text-white">{user.displayName || user.username}</span>
            <span className="text-[8px] text-white/40 uppercase tracking-widest">{level} · {points} pts</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all"
            title="登出魔法世界"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
