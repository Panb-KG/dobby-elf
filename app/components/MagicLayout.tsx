"use client";

/**
 * MagicLayout - 魔法布局组件 (Slim v4)
 * 仅负责组装，业务逻辑已拆分至专用 hooks 和 LayoutMain
 */

import { AnimatePresence, motion } from 'motion/react';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useMagicState } from './layout/useMagicState';
import { LayoutMain } from './layout/LayoutMain';
import Header from './layout/Header';
import { ShortcutsSidebar } from './layout/ShortcutsSidebar';
import { MobileNav } from './layout/MobileNav';
import { RightSidebarContent } from './RightSidebarContent';
import { ReminderToast } from './layout/ReminderToast';
import { SyncIndicator } from './layout/SyncIndicator';
import type { MagicLayoutProps } from './layout/types';
import type { VoiceChatProps } from './chat/types';

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

  const vc = useVoiceChat({
    onResult: (text) => { if (text.trim()) chat.sendMessage(text.trim()); },
  });

  const voiceChat: VoiceChatProps = {
    isRecording: vc.isRecording,
    interimText: vc.interimText,
    finalText: vc.finalText,
    isSpeaking: vc.isSpeaking,
    isSpeechRecognitionSupported: vc.isSpeechRecognitionSupported,
    isSpeechSynthesisSupported: vc.isSpeechSynthesisSupported,
    autoSpeak: vc.autoSpeak,
    mode: vc.mode,
    onStartRecording: vc.startRecording,
    onStopRecording: vc.stopRecording,
    onCancelRecording: vc.cancelRecording,
    onSpeak: vc.speak,
    onStopSpeaking: vc.stopSpeaking,
    onToggleAutoSpeak: vc.toggleAutoSpeak,
    onToggleMode: vc.toggleMode,
    onSubmitText: (text) => { vc.resetFinalText(); },
  };

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      <div className="atmosphere" />
      <ReminderToast reminder={s.activeReminder} onDismiss={() => s.setActiveReminder(null)} />
      <Header user={user} points={s.points} level={s.level} onLogout={onLogout}
        onRightSidebarToggle={() => onRightSidebarChange(!isRightSidebarOpen)}
        isRightSidebarOpen={isRightSidebarOpen} />

      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden z-10 transition-all duration-300 ease-in-out"
        style={{ marginRight: isRightSidebarOpen ? '24rem' : '0' }}>
        <ShortcutsSidebar shortcuts={shortcuts} onUseSpell={s.useSpell} />

        <LayoutMain
          chat={chat} course={course} homework={homework} achievements={achievements}
          focus={focus} shortcuts={shortcuts} dailyTasks={s.dailyTasks}
          points={s.points} level={s.level} streak={streak}
          showDailyAdventure={s.showDailyAdventure}
          onToggleDailyAdventure={() => s.setShowDailyAdventure(!s.showDailyAdventure)}
          onCompleteTask={s.completeTask} shortcutButtons={s.shortcutButtons}
          isComplexContent={s.isComplexContent}
          handleComplexContentClick={s.handleComplexContentClick}
          useSpell={s.useSpell}
          isRightSidebarOpen={isRightSidebarOpen}
          onRightSidebarChange={onRightSidebarChange}
          onSidebarContentTypeChange={onSidebarContentTypeChange}
          onTabChange={onTabChange}
          voiceChat={voiceChat} />

        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: '24rem', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full z-50 flex flex-col glass-panel overflow-hidden shadow-2xl">
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
                audioRef={s.audioRef} />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
      <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
      <SyncIndicator />
    </div>
  );
}
