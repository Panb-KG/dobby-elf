"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'schedule' | 'exercise' | 'achievements' | 'focus';
  children?: React.ReactNode;
}

export default function RightSidebar({ isOpen, onClose, contentType, children }: RightSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          
          {/* 侧边栏 */}
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 glass-panel border-l border-white/10 z-50 flex flex-col"
          >
            {/* 头部 */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
              <h2 className="text-lg font-serif text-white">
                {contentType === 'schedule' && '课程表'}
                {contentType === 'exercise' && '互动练习'}
                {contentType === 'achievements' && '成就详情'}
                {contentType === 'focus' && '专注统计'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
