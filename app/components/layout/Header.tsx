"use client";

import React from 'react';
import { LogOut, Bell } from 'lucide-react';
import type { User } from '../../types';

interface HeaderProps {
  user: User;
  points: number;
  level: string;
  onLogout: () => void;
}

export default function Header({ user, points, level, onLogout }: HeaderProps) {
  return (
    <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-serif text-white">魔法小课桌</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* 用户信息 */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-white font-medium">{user.displayName || user.username}</div>
            <div className="text-xs text-white/40">{level} · {points} 积分</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-magic-accent/20 flex items-center justify-center">
            <span className="text-magic-accent font-bold">{user.username[0]?.toUpperCase()}</span>
          </div>
        </div>
        
        {/* 通知 */}
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors relative">
          <Bell className="w-5 h-5 text-white/60" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        {/* 退出登录 */}
        <button
          onClick={onLogout}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          title="退出登录"
        >
          <LogOut className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </header>
  );
}
