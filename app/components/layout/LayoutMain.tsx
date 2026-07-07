"use client";

/**
 * LayoutMain - 中央聊天区域
 * 包含 DailyAdventure + ChatModule + 动画效果
 */

import { useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DailyAdventure } from '../DailyAdventure';
import { ChatModule } from '../chat/ChatModule';
import type { UseChatReturn } from '../../hooks/useChat';
import type { UseCoursesReturn } from '../../hooks/useCourses';
import type { UseAchievementsReturn } from '../../hooks/useAchievements';
import type { UseHomeworkReturn } from '../../hooks/useHomework';
import type { UseFocusReturn } from '../../hooks/useFocus';
import type { Spell } from '../../types';
import type { VoiceChatProps } from '../chat/types';
import type { VoiceChatState } from '../../hooks/voice-chat-types';

interface LayoutMainProps {
  chat: UseChatReturn;
  course: UseCoursesReturn;
  homework: UseHomeworkReturn;
  achievements: UseAchievementsReturn;
  focus: UseFocusReturn;
  shortcuts: Spell[];
  dailyTasks: Array<{ id: string; text: string; completed: boolean; reward: number }>;
  points: number;
  level: string;
  streak: number;
  showDailyAdventure: boolean;
  onToggleDailyAdventure: () => void;
  onCompleteTask: (id: string) => void;
  shortcutButtons: Array<{ id: string; name: string; prompt: string }>;
  isComplexContent: (text: string) => boolean;
  handleComplexContentClick: (text: string) => void;
  useSpell: (spell: Spell) => void;
  isRightSidebarOpen: boolean;
  onRightSidebarChange: (open: boolean) => void;
  onSidebarContentTypeChange: (
    type: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content',
  ) => void;
  onTabChange: (
    tab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus',
  ) => void;
  voiceChat: VoiceChatProps;
}

export const LayoutMain = memo(function LayoutMain({
  chat, course, shortcuts, dailyTasks, points, level, streak,
  showDailyAdventure, onToggleDailyAdventure, onCompleteTask,
  shortcutButtons, isComplexContent, handleComplexContentClick,
  isRightSidebarOpen, onRightSidebarChange, onSidebarContentTypeChange,
  onTabChange, voiceChat,
}: LayoutMainProps) {
  const handleQuickAction = useCallback((action: string) => {
    onToggleDailyAdventure();
    if (action === 'schedule') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('schedule');
    } else if (action === 'homework') {
      onTabChange('homework');
    } else if (action === 'focus') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('focus');
    } else if (action === 'achievements') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('achievements');
    }
  }, [onToggleDailyAdventure, onRightSidebarChange, onSidebarContentTypeChange, onTabChange]);

  return (
    <section className="flex-1 flex flex-col glass-panel overflow-hidden relative">
      <AnimatePresence>
        {showDailyAdventure && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <DailyAdventure
              courses={course.courses}
              dailyTasks={dailyTasks}
              points={points}
              level={level}
              streak={streak}
              onCompleteTask={onCompleteTask}
              onQuickAction={handleQuickAction}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden">
        <ChatModule
          messages={chat.messages}
          input={chat.input}
          isLoading={chat.isLoading}
          onSend={chat.sendMessage}
          onInputChange={chat.handleInputChange}
          onShortcut={chat.handleShortcut}
          shortcuts={shortcutButtons}
          isComplexContent={isComplexContent}
          onComplexContentClick={handleComplexContentClick}
          showDailyAdventure={showDailyAdventure}
          onToggleDailyAdventure={onToggleDailyAdventure}
          voiceChat={voiceChat}
        />
      </div>
    </section>
  );
});
