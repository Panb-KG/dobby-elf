"use client";

import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

interface ReminderToastProps {
  reminder: { subject: string; time: string } | null;
  onDismiss: () => void;
}

export function ReminderToast({ reminder, onDismiss }: ReminderToastProps) {
  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="p-4 rounded-2xl bg-magic-accent border border-white/20 shadow-2xl shadow-magic-accent/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm">魔法提醒！✨</h4>
              <p className="text-white/80 text-xs">
                小主人，你的"<span className="font-bold">{reminder.subject}</span>"课程将在 <span className="font-bold">{reminder.time}</span> 开始。快准备好你的魔法棒吧！
              </p>
            </div>
            <button onClick={onDismiss} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
