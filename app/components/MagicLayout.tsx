"use client";

/**
 * MagicLayout - 魔法布局组件 (Production v3)
 * 主界面布局容器：左侧咒语库 + 中央聊天区 + 右侧魔法展示窗
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyAdventure } from './DailyAdventure';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import { ChatModule } from './chat/ChatModule';
import { RightSidebarContent } from './RightSidebarContent';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useMagicState } from './layout/useMagicState';
import { ReminderToast } from './layout/ReminderToast';
import { ShortcutsSidebar } from './layout/ShortcutsSidebar';
import { MobileNav } from './layout/MobileNav';
import type { UseChatReturn } from '../hooks/useChat';
import type { UseCoursesReturn } from '../hooks/useCourses';
import type { UseHomeworkReturn } from '../hooks/useHomework';
import type { UseAchievementsReturn } from '../hooks/useAchievements';
import type { UseFocusReturn } from '../hooks/useFocus';
import type { User, Spell } from '../types';

interface MagicLayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus';
  onTabChange: (tab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus') => void;
  isRightSidebarOpen: boolean;
  onRightSidebarChange: (open: boolean) => void;
  sidebarContentType: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content' | 'none';
  onSidebarContentTypeChange: (type: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content') => void;
  chat: UseChatReturn;
  shortcuts: Spell[];
  course: UseCoursesReturn;
  homework: UseHomeworkReturn;
  achievements: UseAchievementsReturn;
  focus: UseFocusReturn;
  streak: number;
  onStreak: () => void;
}

export default function MagicLayout(props: MagicLayoutProps) {
  const {
    user, onLogout, activeTab, onTabChange,
    isRightSidebarOpen, onRightSidebarChange,
    sidebarContentType, onSidebarContentTypeChange,
    chat, shortcuts, course, homework, achievements, focus,
    streak, onStreak,
  } = props;

  const s = useMagicState({
    user, course, focus, chat, onRightSidebarChange, onSidebarContentTypeChange, shortcuts,
  });

  const voiceChat = useVoiceChat({
    onResult: (text) => { if (text.trim()) chat.sendMessage(text.trim()); },
  });

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      <div className="atmosphere" />

      <ReminderToast reminder={s.activeReminder} onDismiss={() => s.setActiveReminder(null)} />

      <Header
        user={user}
        points={s.points}
        level={s.level}
        onLogout={onLogout}
        onRightSidebarToggle={() => onRightSidebarChange(!isRightSidebarOpen)}
        isRightSidebarOpen={isRightSidebarOpen}
      />

      <main
        className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden z-10 transition-all duration-300 ease-in-out"
        style={{ marginRight: isRightSidebarOpen ? '24rem' : '0' }}
      >
        <ShortcutsSidebar shortcuts={shortcuts} onUseSpell={s.useSpell} />

        <section className="flex-1 flex flex-col glass-panel overflow-hidden relative">
          <AnimatePresence>
            {s.showDailyAdventure && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <DailyAdventure
                  courses={course.courses}
                  dailyTasks={s.dailyTasks}
                  points={s.points}
                  level={s.level}
                  streak={streak}
                  onCompleteTask={s.completeTask}
                  onQuickAction={(action) => {
                    s.setShowDailyAdventure(false);
                    if (action === 'schedule') { onRightSidebarChange(true); onSidebarContentTypeChange('schedule'); }
                    else if (action === 'homework') { onTabChange('homework'); }
                    else if (action === 'focus') { onRightSidebarChange(true); onSidebarContentTypeChange('focus'); }
                    else if (action === 'achievements') { onRightSidebarChange(true); onSidebarContentTypeChange('achievements'); }
                  }}
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
              shortcuts={s.shortcutButtons}
              isComplexContent={s.isComplexContent}
              onComplexContentClick={s.handleComplexContentClick}
              showDailyAdventure={s.showDailyAdventure}
              onToggleDailyAdventure={() => s.setShowDailyAdventure(!s.showDailyAdventure)}
              voiceChat={{
                isRecording: voiceChat.isRecording,
                interimText: voiceChat.interimText,
                finalText: voiceChat.finalText,
                isSpeaking: voiceChat.isSpeaking,
                isSpeechRecognitionSupported: voiceChat.isSpeechRecognitionSupported,
                isSpeechSynthesisSupported: voiceChat.isSpeechSynthesisSupported,
                autoSpeak: voiceChat.autoSpeak,
                mode: voiceChat.mode,
                onStartRecording: voiceChat.startRecording,
                onStopRecording: voiceChat.stopRecording,
                onCancelRecording: voiceChat.cancelRecording,
                onSpeak: voiceChat.speak,
                onStopSpeaking: voiceChat.stopSpeaking,
                onToggleAutoSpeak: voiceChat.toggleAutoSpeak,
                onToggleMode: voiceChat.toggleMode,
                onSubmitText: (text) => { voiceChat.resetFinalText(); },
              }}
            />
          </div>
        </section>

        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: '24rem', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full z-50 flex flex-col glass-panel overflow-hidden shadow-2xl"
            >
              <RightSidebarContent
                sidebarContentType={sidebarContentType}
                selectedContent={s.selectedContent}
                contentTitle={s.contentTitle}
                generatedImage={s.generatedImage}
                onClose={() => onRightSidebarChange(false)}
                onContentTypeChange={onSidebarContentTypeChange}
                courses={course.courses}
                scheduleView={course.scheduleView}
                selectedDay={course.selectedDay}
                isAddingCourse={course.isAddingCourse}
                newCourse={course.newCourse}
                onScheduleViewChange={course.setScheduleView}
                onSelectedDayChange={course.setSelectedDay}
                onIsAddingCourseChange={course.setIsAddingCourse}
                onNewCourseChange={course.setNewCourse}
                onAddCourse={course.addCourse}
                knowledgeGraph={s.knowledgeGraph}
                dynamicExercises={s.dynamicExercises}
                currentExerciseIndex={s.currentExerciseIndex}
                onCurrentExerciseIndexChange={s.setCurrentExerciseIndex}
                exerciseAnswers={s.exerciseAnswers}
                onExerciseAnswersChange={s.setExerciseAnswers}
                showExerciseResult={s.showExerciseResult}
                onShowExerciseResultChange={s.setShowExerciseResult}
                onDynamicExercisesChange={s.setDynamicExercises}
                points={s.points}
                level={s.level}
                treeGrowth={s.treeGrowth}
                dailyTasks={s.dailyTasks}
                achievements={achievements.achievements}
                onCompleteTask={s.completeTask}
                onWaterTree={s.waterTree}
                focus={focus}
                audioRef={s.audioRef}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
