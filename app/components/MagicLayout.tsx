"use client";

/**
 * MagicLayout - 魔法布局组件 (Production v3)
 * 
 * 主界面布局容器：左侧咒语库 + 中央聊天区 + 右侧魔法展示窗
 * 侧边栏内容已抽离至 RightSidebarContent.tsx
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Calendar, Pencil, Trophy, Hourglass, Sparkles, BookOpen, User as UserIcon, ChevronRight, Bell, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { DobiAvatar } from './DobiAvatar';
import { DailyAdventure } from './DailyAdventure';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import { ChatModule } from './chat/ChatModule';
import { RightSidebarContent } from './RightSidebarContent';
import { useVoiceChat } from '../hooks/useVoiceChat';
import type { UseChatReturn } from '../hooks/useChat';
import type { UseCoursesReturn } from '../hooks/useCourses';
import type { UseHomeworkReturn } from '../hooks/useHomework';
import type { UseAchievementsReturn } from '../hooks/useAchievements';
import type { UseFocusReturn } from '../hooks/useFocus';
import type { User, Spell, KnowledgePoint, DailyTask, Achievement } from '../types';

// ===== 类型定义 =====

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

// ===== 主组件 =====

export default function MagicLayout(props: MagicLayoutProps) {
  const {
    user, onLogout, activeTab, onTabChange,
    isRightSidebarOpen, onRightSidebarChange,
    sidebarContentType, onSidebarContentTypeChange,
    chat, shortcuts, course, homework, achievements, focus,
    streak, onStreak,
  } = props;

  // ===== 侧边栏状态 =====
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgePoint[]>([
    { name: '分数乘法', status: 'mastered', subject: '数学' },
    { name: '过去进行时', status: 'learning', subject: '英语' },
    { name: '古诗词鉴赏', status: 'learning', subject: '语文' },
  ]);
  const [dynamicExercises, setDynamicExercises] = useState<{
    subject: string; grade: string;
    questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }>;
  } | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showExerciseResult, setShowExerciseResult] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [activeReminder, setActiveReminder] = useState<{ subject: string; time: string } | null>(null);
  const [showDailyAdventure, setShowDailyAdventure] = useState(true);

  // 用户数据
  const [points, setPoints] = useState(user.points || 1250);
  const [level, setLevel] = useState(user.level || '魔法学徒');
  const [treeGrowth, setTreeGrowth] = useState(user.treeGrowth || 0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(user.dailyTasks || [
    { id: 'task1', text: '完成3道奥数题', completed: false, reward: 50 },
    { id: 'task2', text: '背诵5个新单词', completed: false, reward: 30 },
    { id: 'task3', text: '查看今日课程表', completed: false, reward: 10 },
  ]);

  // 专注模式音频
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ===== 智能提醒系统 =====
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const currentDay = days[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      course.courses.forEach(c => {
        if (c.day === currentDay) {
          const startTime = c.time.split(' - ')[0];
          if (!startTime) return;
          const [h, m] = startTime.split(':').map(Number);
          const courseDate = new Date();
          courseDate.setHours(h, m, 0, 0);
          const diff = (courseDate.getTime() - now.getTime()) / (1000 * 60);
          if (diff > 0 && diff <= 5) {
            setActiveReminder({ subject: c.subject, time: startTime });
          }
        }
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [course.courses]);

  // ===== 白噪音逻辑 =====
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    const audio = audioRef.current;
    if (focus.whiteNoise !== 'none') {
      const urls: Record<string, string> = {
        library: 'https://www.soundjay.com/ambient/library-ambience-01.mp3',
        rain: 'https://www.soundjay.com/nature/rain-01.mp3',
        fire: 'https://www.soundjay.com/household/fireplace-01.mp3',
      };
      const targetUrl = urls[focus.whiteNoise];
      if (audio.src !== targetUrl) {
        audio.src = targetUrl;
        audio.load();
      }
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    return () => { audio.pause(); };
  }, [focus.whiteNoise]);

  // ===== 标签页切换检测 =====
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && focus.isFocusing) {
        focus.pauseFocus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [focus.isFocusing, focus.pauseFocus]);

  // ===== 用户数据同步 =====
  useEffect(() => {
    setPoints(user.points || 1250);
    setLevel(user.level || '魔法学徒');
    setTreeGrowth(user.treeGrowth || 0);
    if (user.dailyTasks && user.dailyTasks.length > 0) {
      setDailyTasks(user.dailyTasks);
    }
  }, [user]);

  // ===== 回调函数 =====

  const completeTask = useCallback(async (taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    const newTasks = dailyTasks.map(t => t.id === taskId ? { ...t, completed: true } : t);
    const newPoints = points + task.reward;
    let newLevel = level;
    if (newPoints >= 5000) newLevel = '大魔法师';
    else if (newPoints >= 3000) newLevel = '高级魔法师';
    else if (newPoints >= 2000) newLevel = '中级魔法师';
    else if (newPoints >= 1000) newLevel = '初级魔法师';
    setDailyTasks(newTasks);
    setPoints(newPoints);
    setLevel(newLevel);
  }, [dailyTasks, points, level]);

  const waterTree = useCallback(() => {
    if (points < 50) return;
    setPoints(prev => prev - 50);
    setTreeGrowth(prev => prev + 1);
  }, [points]);

  const useSpell = useCallback((spell: Spell) => {
    chat.handleShortcut(spell.prompt);
    if (spell.id === 'schedule') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('schedule');
    } else if (spell.id === 'homework' || spell.id === 'math') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('exercise');
    } else if (spell.id === 'achievements') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('achievements');
    } else if (spell.id === 'focus') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('focus');
    }
  }, [chat, onRightSidebarChange, onSidebarContentTypeChange]);

  const isComplexContent = useCallback((text: string) => {
    return text.includes('<table') || text.includes('<div') || text.includes('<h1') || text.includes('<h2') || text.length > 500;
  }, []);

  const handleComplexContentClick = useCallback((text: string) => {
    setSelectedContent(text);
    const titleMatch = text.match(/<h1[^>]*>(.*?)<\/h1>/);
    setContentTitle(titleMatch ? titleMatch[1] : '详细内容');
    onSidebarContentTypeChange('content');
    onRightSidebarChange(true);
  }, [onRightSidebarChange, onSidebarContentTypeChange]);

  // ===== 快捷指令按钮 =====
  const shortcutButtons = useMemo(() => shortcuts.map(spell => ({
    id: spell.id,
    name: spell.name,
    prompt: spell.prompt,
  })), [shortcuts]);

  // ===== 语音聊天 =====
  const voiceChat = useVoiceChat({
    onResult: (text) => {
      // 语音识别结果自动发送
      if (text.trim()) {
        chat.sendMessage(text.trim());
      }
    },
  });

  // ===== 渲染 =====
  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      <div className="atmosphere" />

      {/* 智能提醒 Toast */}
      <AnimatePresence>
        {activeReminder && (
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
                  小主人，你的"<span className="font-bold">{activeReminder.subject}</span>"课程将在 <span className="font-bold">{activeReminder.time}</span> 开始。快准备好你的魔法棒吧！
                </p>
              </div>
              <button onClick={() => setActiveReminder(null)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 头部 */}
      <Header
        user={user}
        points={points}
        level={level}
        onLogout={onLogout}
        onRightSidebarToggle={() => onRightSidebarChange(!isRightSidebarOpen)}
        isRightSidebarOpen={isRightSidebarOpen}
      />

      {/* 主体内容 */}
      <main
        className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden z-10 transition-all duration-300 ease-in-out"
        style={{ marginRight: isRightSidebarOpen ? '24rem' : '0' }}
      >
        {/* 左侧咒语库 (Desktop) */}
        <aside className="hidden md:flex flex-col gap-4 w-64">
          <div className="glass-panel p-6 flex-1 flex flex-col gap-6">
            <h2 className="text-sm font-serif italic text-white/60 border-b border-white/10 pb-2">魔法咒语库</h2>
            <div className="space-y-3">
              {shortcuts.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => useSpell(spell)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left"
                >
                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-magic-accent/20 transition-colors">
                    {spell.id === 'schedule' && <Calendar className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                    {spell.id === 'homework' && <Pencil className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                    {spell.id === 'words' && <Sparkles className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                    {spell.id === 'math' && <Sparkles className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                    {spell.id === 'focus' && <Hourglass className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                    {spell.id === 'achievements' && <Trophy className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                  </div>
                  <span className="text-sm font-medium text-white/80">{spell.name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-magic-accent/10 to-transparent border border-magic-accent/20">
              <p className="text-xs text-white/60 leading-relaxed italic">
                "知识是唯一的魔法，而你是那个伟大的魔法师。"
              </p>
            </div>
          </div>
        </aside>

        {/* 中央聊天区 */}
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
                  onCompleteTask={completeTask}
                  onQuickAction={(action) => {
                    setShowDailyAdventure(false);
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
              shortcuts={shortcutButtons}
              isComplexContent={isComplexContent}
              onComplexContentClick={handleComplexContentClick}
              showDailyAdventure={showDailyAdventure}
              onToggleDailyAdventure={() => setShowDailyAdventure(!showDailyAdventure)}
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
                onSubmitText: (text) => {
                  voiceChat.resetFinalText();
                },
              }}
            />
          </div>
        </section>

        {/* 右侧魔法展示窗 */}
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
                selectedContent={selectedContent}
                contentTitle={contentTitle}
                generatedImage={generatedImage}
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
                knowledgeGraph={knowledgeGraph}
                dynamicExercises={dynamicExercises}
                currentExerciseIndex={currentExerciseIndex}
                onCurrentExerciseIndexChange={setCurrentExerciseIndex}
                exerciseAnswers={exerciseAnswers}
                onExerciseAnswersChange={setExerciseAnswers}
                showExerciseResult={showExerciseResult}
                onShowExerciseResultChange={setShowExerciseResult}
                onDynamicExercisesChange={setDynamicExercises}
                points={points}
                level={level}
                treeGrowth={treeGrowth}
                dailyTasks={dailyTasks}
                achievements={achievements.achievements}
                onCompleteTask={completeTask}
                onWaterTree={waterTree}
                focus={focus}
                audioRef={audioRef}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden flex items-center justify-around py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl z-10">
        {([
          { id: 'chat', label: '对话', icon: MessageSquare },
          { id: 'course', label: '书库', icon: BookOpen },
          { id: 'achievements', label: '我的', icon: UserIcon },
        ] as const).map(item => (
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
    </div>
  );
}
