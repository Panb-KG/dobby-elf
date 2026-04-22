"use client";

import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Calendar,
  Pencil,
  Trophy,
  Hourglass,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus';
  onTabChange: (tab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus') => void;
}

const TABS = [
  { id: 'chat', label: '对话', icon: MessageSquare },
  { id: 'course', label: '课程', icon: Calendar },
  { id: 'homework', label: '作业', icon: Pencil },
  { id: 'achievements', label: '成就', icon: Trophy },
  { id: 'focus', label: '专注', icon: Hourglass },
] as const;

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <nav className="w-20 glass-panel border-r border-white/10 flex flex-col items-center py-6 gap-4">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? 'bg-magic-accent text-white'
                : 'text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px]">{tab.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
