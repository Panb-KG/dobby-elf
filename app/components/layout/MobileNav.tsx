"use client";

import { MessageSquare, BookOpen, User as UserIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  activeTab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus';
  onTabChange: (tab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus') => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const items = [
    { id: 'chat' as const, label: '对话', icon: MessageSquare },
    { id: 'course' as const, label: '书库', icon: BookOpen },
    { id: 'achievements' as const, label: '我的', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden flex items-center justify-around py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl z-10">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn("flex flex-col items-center gap-1", activeTab === item.id ? "text-magic-accent" : "text-white/40")}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
