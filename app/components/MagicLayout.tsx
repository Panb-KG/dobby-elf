"use client";

/**
 * MagicLayout - 魔法布局组件 (Production v2)
 * 
 * 主界面布局容器，整合完整功能：
 * 1. 左侧咒语库 + 中央聊天区 + 右侧魔法展示窗
 * 2. 完整的课程表、练习、成就、专注功能
 * 3. 从 MagicApp.tsx 迁移的所有核心功能
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Calendar, Pencil, Trophy, Hourglass,
  PanelRightClose, PanelRightOpen, X, Sparkles, BrainCircuit,
  Layout, FileText, ImageIcon,
  BookOpen, Languages, Calculator,
  ChevronRight, Send, Paperclip, Mic,
  Bell, Droplets, Leaf, Flame, CloudRain, Library, VolumeX,
  CheckCircle2, Circle, RotateCcw, TrendingUp, Medal, Award, Star,
  Plus, LogOut, Home, User as UserIcon,
} from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../lib/utils';
import { dobi } from '../services/magicElf';
import { DobiAvatar } from './DobiAvatar';
import { DailyAdventure } from './DailyAdventure';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import { ChatModule } from './chat/ChatModule';
import { CourseModule } from './course/CourseModule';
import { HomeworkModule } from './homework/HomeworkModule';
import { AchievementModule } from './achievements/AchievementModule';
import { FocusModule } from './focus/FocusModule';
import type { UseChatReturn } from '../hooks/useChat';
import type { UseCoursesReturn } from '../hooks/useCourses';
import type { UseHomeworkReturn } from '../hooks/useHomework';
import type { UseAchievementsReturn } from '../hooks/useAchievements';
import type { UseFocusReturn } from '../hooks/useFocus';
import type { User, Spell, Course, Achievement, KnowledgePoint, DailyTask, WhiteNoiseType } from '../types';

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

  // ===== 从 MagicApp.tsx 迁移的状态 =====
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

  // 用户数据（从 MagicApp 迁移）
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

  // ===== 专注模式计时器 =====
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (focus.isFocusing && focus.elapsedTime > 0) {
      interval = setInterval(() => {
        // 由 useFocus hook 管理
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focus.isFocusing, focus.elapsedTime]);

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

  // ===== 渲染 =====
  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* 背景氛围 */}
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
                    {spell.id === 'words' && <Languages className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                    {spell.id === 'math' && <BrainCircuit className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
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
          {/* 今日冒险卡片 */}
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
          
          {/* 聊天模块 */}
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
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-magic-accent" />
                    <h2 className="text-sm font-serif italic text-white/80">魔法展示窗</h2>
                  </div>
                  <button onClick={() => onRightSidebarChange(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {/* ===== 课程表 ===== */}
                  {sidebarContentType === 'schedule' && (
                    <CourseSidebarContent
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
                      onRemoveCourse={course.removeCourse}
                    />
                  )}

                  {/* ===== 互动练习 ===== */}
                  {sidebarContentType === 'exercise' && (
                    <ExerciseSidebarContent
                      knowledgeGraph={knowledgeGraph}
                      onKnowledgeGraphChange={setKnowledgeGraph}
                      dynamicExercises={dynamicExercises}
                      onDynamicExercisesChange={setDynamicExercises}
                      currentExerciseIndex={currentExerciseIndex}
                      onCurrentExerciseIndexChange={setCurrentExerciseIndex}
                      exerciseAnswers={exerciseAnswers}
                      onExerciseAnswersChange={setExerciseAnswers}
                      showExerciseResult={showExerciseResult}
                      onShowExerciseResultChange={setShowExerciseResult}
                    />
                  )}

                  {/* ===== 魔法绘图 ===== */}
                  {sidebarContentType === 'image' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 min-h-[200px] flex items-center justify-center">
                        {generatedImage ? (
                          <img src={generatedImage} alt="魔法生成图片" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Sparkles className="w-8 h-8 text-magic-accent animate-pulse" />
                            <p className="text-xs text-white/40 italic">正在绘制魔法图像...</p>
                          </div>
                        )}
                      </div>
                      {generatedImage && (
                        <button
                          onClick={() => { const link = document.createElement('a'); link.href = generatedImage; link.download = 'magic-image.png'; link.click(); }}
                          className="w-full py-2 rounded-xl bg-white/5 text-magic-accent text-xs font-bold hover:bg-white/10 transition-all"
                        >
                          保存魔法图片
                        </button>
                      )}
                    </div>
                  )}

                  {/* ===== 成就墙 ===== */}
                  {sidebarContentType === 'achievements' && (
                    <AchievementsSidebarContent
                      points={points}
                      level={level}
                      treeGrowth={treeGrowth}
                      dailyTasks={dailyTasks}
                      achievements={achievements.achievements}
                      onCompleteTask={completeTask}
                      onWaterTree={waterTree}
                    />
                  )}

                  {/* ===== 专注模式 ===== */}
                  {sidebarContentType === 'focus' && (
                    <FocusSidebarContent
                      focus={focus}
                      audioRef={audioRef}
                    />
                  )}

                  {/* ===== 复杂内容 ===== */}
                  {sidebarContentType === 'content' && selectedContent && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                      <div className="sticky top-0 z-20 pt-1 pb-4 space-y-4">
                        <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5">
                          <div>
                            <h3 className="text-lg font-serif font-bold text-white mb-1">{contentTitle}</h3>
                            <p className="text-xs text-white/40">多比的魔法内容</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="markdown-body">
                          <Markdown rehypePlugins={[rehypeRaw]}>{selectedContent}</Markdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== 空状态 ===== */}
                  {sidebarContentType === 'none' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-serif italic">
                        等待多比为你展示魔法内容...<br />
                        你可以试着点击左侧的"课程表"或"作业"。
                      </p>
                    </div>
                  )}
                </div>

                {/* 底部导航 */}
                <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                  {(['schedule', 'exercise', 'achievements', 'focus'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => onSidebarContentTypeChange(type)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                        sidebarContentType === type ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                      )}
                    >
                      {type === 'schedule' && '课程表'}
                      {type === 'exercise' && '练习题'}
                      {type === 'achievements' && '成就墙'}
                      {type === 'focus' && '专注'}
                    </button>
                  ))}
                </div>
              </div>
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

// ===== 子组件：课程表侧边栏 =====

interface CourseSidebarProps {
  courses: Course[];
  scheduleView: 'week' | 'day';
  selectedDay: string;
  isAddingCourse: boolean;
  newCourse: { day: string; subject: string; time: string; type: '校内' | '课外' };
  onScheduleViewChange: (view: 'week' | 'day') => void;
  onSelectedDayChange: (day: string) => void;
  onIsAddingCourseChange: (adding: boolean) => void;
  onNewCourseChange: (course: { day: string; subject: string; time: string; type: '校内' | '课外' }) => void;
  onAddCourse: () => void;
  onRemoveCourse?: (index: number) => void;
}

function CourseSidebarContent({
  courses, scheduleView, selectedDay, isAddingCourse, newCourse,
  onScheduleViewChange, onSelectedDayChange, onIsAddingCourseChange,
  onNewCourseChange, onAddCourse,
}: CourseSidebarProps) {
  const courseColors = [
    'bg-blue-500/20 border-blue-500/30',
    'bg-purple-500/20 border-purple-500/30',
    'bg-amber-500/20 border-amber-500/30',
    'bg-emerald-500/20 border-emerald-500/30',
    'bg-rose-500/20 border-rose-500/30',
    'bg-sky-500/20 border-sky-500/30',
    'bg-indigo-500/20 border-indigo-500/30',
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      <div className="sticky top-0 z-20 pt-1 pb-4 space-y-4">
        <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5">
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-1">我的魔法课程表</h3>
            <p className="text-xs text-white/40">2026年3月 · 第一周</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onIsAddingCourseChange(!isAddingCourse)}
              className={cn(
                "p-2 rounded-xl transition-all border",
                isAddingCourse ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-magic-accent/20 border-magic-accent/30 text-magic-accent hover:bg-magic-accent/30"
              )}
            >
              {isAddingCourse ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(['week', 'day'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => onScheduleViewChange(view)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    scheduleView === view ? "bg-magic-accent text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  )}
                >
                  {view === 'week' ? '周' : '日'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isAddingCourse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCourse.day}
                onChange={(e) => onNewCourseChange({ ...newCourse, day: e.target.value })}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
              >
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={newCourse.type}
                onChange={(e) => onNewCourseChange({ ...newCourse, type: e.target.value as '校内' | '课外' })}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
              >
                <option value="校内">校内</option>
                <option value="课外">课外</option>
              </select>
            </div>
            <input
              type="text" placeholder="课程名称"
              value={newCourse.subject}
              onChange={(e) => onNewCourseChange({ ...newCourse, subject: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
            />
            <input
              type="text" placeholder="时间 (如: 09:00 - 10:30)"
              value={newCourse.time}
              onChange={(e) => onNewCourseChange({ ...newCourse, time: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
            />
            <button
              onClick={onAddCourse}
              className="w-full py-2 bg-magic-accent text-white rounded-lg text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              添加魔法课程
            </button>
          </motion.div>
        )}

        {scheduleView === 'day' && (
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar">
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
              <button
                key={day}
                onClick={() => onSelectedDayChange(day)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all border",
                  selectedDay === day ? "bg-white/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 mt-4">
        {courses
          .filter(item => scheduleView === 'week' || item.day === selectedDay)
          .map((item, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={`${item.day}-${item.subject}-${idx}`}
              className={cn("p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-default", item.color || courseColors[idx % courseColors.length])}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.day}</span>
                  <h4 className="font-medium text-white">{item.subject}</h4>
                </div>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                  item.type === '校内' ? "bg-white/10 text-white/60" : "bg-magic-accent/20 text-magic-accent"
                )}>
                  {item.type}
                </span>
              </div>
              <span className="text-xs text-white/40 font-mono">{item.time}</span>
            </motion.div>
          ))}
      </div>
    </div>
  );
}

// ===== 子组件：练习侧边栏 =====

interface ExerciseSidebarProps {
  knowledgeGraph: KnowledgePoint[];
  onKnowledgeGraphChange: (graph: KnowledgePoint[]) => void;
  dynamicExercises: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null;
  onDynamicExercisesChange: (ex: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null) => void;
  currentExerciseIndex: number;
  onCurrentExerciseIndexChange: (idx: number) => void;
  exerciseAnswers: Record<string, string>;
  onExerciseAnswersChange: (answers: Record<string, string>) => void;
  showExerciseResult: boolean;
  onShowExerciseResultChange: (show: boolean) => void;
}

function ExerciseSidebarContent({
  knowledgeGraph, dynamicExercises, currentExerciseIndex, exerciseAnswers,
  showExerciseResult, onCurrentExerciseIndexChange, onExerciseAnswersChange,
  onShowExerciseResultChange, onDynamicExercisesChange,
}: ExerciseSidebarProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 知识图谱 */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
          <BrainCircuit className="w-3 h-3" />
          魔法知识图谱
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {knowledgeGraph.map((point, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{point.subject}</span>
                <span className="text-sm text-white font-medium">{point.name}</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                point.status === 'mastered' ? "bg-emerald-500/20 text-emerald-400" : "bg-magic-accent/20 text-magic-accent animate-pulse"
              )}>
                {point.status === 'mastered' ? '已掌握' : '修炼中'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 动态练习 */}
      {dynamicExercises ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">互动练习：{dynamicExercises.subject}</h3>
            <span className="text-[10px] text-magic-accent font-bold">{currentExerciseIndex + 1} / {dynamicExercises.questions.length}</span>
          </div>
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            {!showExerciseResult ? (
              <>
                <p className="text-sm text-white leading-relaxed">
                  {dynamicExercises.questions[currentExerciseIndex].question}
                </p>
                <div className="space-y-2">
                  {dynamicExercises.questions[currentExerciseIndex].options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => onExerciseAnswersChange({ ...exerciseAnswers, [dynamicExercises.questions[currentExerciseIndex].id]: opt })}
                      className={cn(
                        "w-full p-3 rounded-xl border text-left text-xs transition-all",
                        exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id] === opt
                          ? "bg-magic-accent/10 border-magic-accent text-magic-accent"
                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  {currentExerciseIndex > 0 && (
                    <button onClick={() => onCurrentExerciseIndexChange(currentExerciseIndex - 1)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase">
                      上一题
                    </button>
                  )}
                  {currentExerciseIndex < dynamicExercises.questions.length - 1 ? (
                    <button onClick={() => onCurrentExerciseIndexChange(currentExerciseIndex + 1)} disabled={!exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id]} className="flex-1 py-2 rounded-xl bg-magic-accent text-white text-[10px] font-bold uppercase disabled:opacity-50">
                      下一题
                    </button>
                  ) : (
                    <button onClick={() => onShowExerciseResultChange(true)} disabled={!exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id]} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase disabled:opacity-50">
                      提交魔法
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-serif italic text-white">练习完成！</h4>
                <p className="text-xs text-white/60">你真棒！多比为你准备了详细的魔法解析。</p>
                <div className="space-y-4 text-left mt-6">
                  {dynamicExercises.questions.map((q, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/40">第 {idx + 1} 题</span>
                        {exerciseAnswers[q.id] === q.answer ? (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">正确</span>
                        ) : (
                          <span className="text-[10px] font-bold text-magic-accent uppercase">错误</span>
                        )}
                      </div>
                      <p className="text-xs text-white/80">{q.question}</p>
                      <p className="text-[10px] text-emerald-400/80 leading-relaxed italic">
                        <span className="font-bold">魔法解析：</span>{q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
                <button onClick={() => onDynamicExercisesChange(null)} className="w-full py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all">
                  返回图谱
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-magic-accent/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-magic-accent" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-white">暂无动态练习</h4>
            <p className="text-[10px] text-white/40 leading-relaxed">
              你可以对多比说"我想练习一下分数乘法"，多比会立刻为你生成专属题目！
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 子组件：成就侧边栏 =====

interface AchievementsSidebarProps {
  points: number;
  level: string;
  treeGrowth: number;
  dailyTasks: DailyTask[];
  achievements: Achievement[];
  onCompleteTask: (id: string) => void;
  onWaterTree: () => void;
}

function AchievementsSidebarContent({
  points, level, treeGrowth, dailyTasks, achievements,
  onCompleteTask, onWaterTree,
}: AchievementsSidebarProps) {
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = { Award, Trophy, Star, Medal };
    return icons[iconName] || Award;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 积分卡片 */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-magic-accent to-orange-600 shadow-lg shadow-magic-accent/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">当前等级</span>
            <span className="text-white font-serif font-bold text-lg">{level}</span>
          </div>
          <TrendingUp className="w-4 h-4 text-white/60" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-serif font-bold text-white">{points}</span>
          <span className="text-sm text-white/60 font-medium">pts</span>
        </div>
        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (points % 1000) / 10)}%` }} />
        </div>
        <p className="text-[10px] mt-2 text-white/60">距离下一等级还差 {1000 - (points % 1000)} 积分</p>
      </div>

      {/* 知识之树 */}
      <div className="p-5 rounded-3xl bg-emerald-900/40 border border-emerald-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-serif italic text-emerald-100">知识之树</h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">等级 {Math.floor(treeGrowth / 5) + 1}</span>
        </div>
        <div className="relative h-32 flex items-end justify-center mb-4">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <motion.path d="M50 90 L50 60" stroke="#5d4037" strokeWidth="4" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            {treeGrowth > 0 && <motion.circle cx="50" cy="50" r={Math.min(30, 10 + treeGrowth * 2)} fill="#2e7d32" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
            {treeGrowth > 10 && <motion.circle cx="35" cy="40" r="15" fill="#43a047" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
            {treeGrowth > 20 && <motion.circle cx="65" cy="40" r="15" fill="#43a047" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
          </svg>
        </div>
        <button onClick={onWaterTree} disabled={points < 50} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
          <Droplets className="w-4 h-4" /> 灌溉知识之树 (50 pts)
        </button>
      </div>

      {/* 每日任务 */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">每日魔法任务</h3>
        <div className="space-y-2">
          {dailyTasks.map(task => (
            <button key={task.id} onClick={() => onCompleteTask(task.id)} disabled={task.completed} className={cn(
              "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left",
              task.completed ? "bg-white/5 border-white/5 opacity-60" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-magic-accent/30"
            )}>
              {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-white/20" />}
              <div className="flex-1">
                <p className={cn("text-sm font-medium", task.completed ? "text-white/40 line-through" : "text-white")}>{task.text}</p>
                <span className="text-[10px] text-magic-accent font-bold">+{task.reward} pts</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 成就列表 */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">荣誉记录</h3>
        <div className="grid grid-cols-1 gap-3">
          {achievements.map((ach) => {
            const IconComponent = getIconComponent(ach.iconName);
            return (
              <div key={ach.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                <div className={cn("p-3 rounded-xl bg-white/5", ach.color)}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{ach.title}</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{ach.date}</p>
                </div>
                <Medal className="w-4 h-4 text-white/10 group-hover:text-magic-accent transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== 子组件：专注侧边栏 =====

interface FocusSidebarProps {
  focus: UseFocusReturn;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

function FocusSidebarContent({ focus, audioRef }: FocusSidebarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const whiteNoiseOptions = [
    { id: 'none' as const, name: '静音', icon: VolumeX },
    { id: 'library' as const, name: '魔法图书馆', icon: Library },
    { id: 'rain' as const, name: '禁林细雨', icon: CloudRain },
    { id: 'fire' as const, name: '休息室壁炉', icon: Flame },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 魔法沙漏 */}
      <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-magic-accent to-transparent" />
        </div>
        <div className="relative mb-6">
          <motion.div
            animate={focus.isFocusing ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 2, repeat: focus.isFocusing ? Infinity : 0, ease: "easeInOut" }}
            className="w-24 h-24 flex items-center justify-center"
          >
            <Hourglass className={cn("w-16 h-16 transition-colors", focus.isFocusing ? "text-magic-accent" : "text-white/20")} />
          </motion.div>
        </div>
        <div className="space-y-1 mb-8">
          <h3 className="text-3xl font-mono font-bold text-white tracking-widest">{formatTime(focus.elapsedTime)}</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
            {focus.isFocusing ? '专注魔法生效中...' : '准备好开始专注了吗？'}
          </p>
        </div>
        <div className="flex gap-3 w-full">
          {!focus.isFocusing ? (
            <button onClick={() => focus.startFocus(25)} className="flex-1 py-3 rounded-xl bg-magic-accent text-white text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 transition-all">
              开启沙漏
            </button>
          ) : (
            <button onClick={focus.pauseFocus} className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all">
              暂停魔法
            </button>
          )}
          {(focus.elapsedTime < focus.duration && !focus.isFocusing) && (
            <button onClick={focus.stopFocus} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 白噪音选择 */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">背景魔法音</h3>
        <div className="grid grid-cols-2 gap-2">
          {whiteNoiseOptions.map(sound => (
            <button
              key={sound.id}
              onClick={() => {
                focus.setWhiteNoise(sound.id);
                if (sound.id !== 'none' && audioRef.current) {
                  audioRef.current.play().catch(() => {});
                }
              }}
              className={cn(
                "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                focus.whiteNoise === sound.id ? "bg-magic-accent/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              )}
            >
              <sound.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{sound.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 提示 */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-[10px] text-white/60 leading-relaxed">
          <span className="text-white font-bold">魔法提示：</span>
          在沙漏开启期间，请不要离开这个页面。如果你切换标签页，魔法沙漏就会碎掉哦！
        </p>
      </div>
    </div>
  );
}
