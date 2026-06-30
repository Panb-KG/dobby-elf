"use client";

/**
 * ClassicPanels - v2.0 包装组件
 * 将 v1 的课程表/练习题/专注/成就面板整合到 v2 三栏布局中
 * 内部管理所有状态，对外只需 type + userId
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useCourses } from '@/hooks/useCourses';
import { useHomework } from '@/hooks/useHomework';
import { useFocus } from '@/hooks/useFocus';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import {
  CourseSidebarContent,
  ExerciseSidebarContent,
  AchievementsSidebarContent,
  FocusSidebarContent,
} from '@/components/RightSidebarContent';
import type { KnowledgePoint, DailyTask } from '@/types';
import type { UseHomeworkReturn } from '@/hooks/useHomework';
import {
  Sparkles, Plus, Trash2, CheckCircle2, Circle,
  Pencil, Clock, ChevronRight,
} from 'lucide-react';

type PanelType = 'schedule' | 'homework' | 'exercise' | 'focus' | 'achievements';

interface ClassicPanelsProps {
  type: PanelType;
  userId?: string;
}

export default function ClassicPanels({ type, userId }: ClassicPanelsProps) {
  // ===== Hooks =====
  const course = useCourses({ userId });
  const homework = useHomework();
  const focus = useFocus({ defaultDuration: 25, autoSave: true });
  const achievements = useAchievements({});

  // ===== Exercise state =====
  const [knowledgeGraph] = useState<KnowledgePoint[]>([
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

  // ===== Achievement state =====
  const [points, setPoints] = useState(1250);
  const [level, setLevel] = useState('魔法学徒');
  const [treeGrowth, setTreeGrowth] = useState(0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: 'task1', text: '完成3道闯关题 🎮', completed: false, reward: 50 },
    { id: 'task2', text: '背诵5个新单词 📖', completed: false, reward: 30 },
    { id: 'task3', text: '查看今日课表 📅', completed: false, reward: 10 },
  ]);

  // ===== Focus audio =====
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && focus.isFocusing) {
        focus.pauseFocus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [focus.isFocusing, focus.pauseFocus]);

  // ===== Callbacks =====
  const completeTask = useCallback((taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    setPoints(prev => {
      const newPoints = prev + task.reward;
      if (newPoints >= 5000) setLevel('大魔法师');
      else if (newPoints >= 3000) setLevel('高级魔法师');
      else if (newPoints >= 2000) setLevel('中级魔法师');
      else if (newPoints >= 1000) setLevel('初级魔法师');
      return newPoints;
    });
  }, [dailyTasks]);

  const waterTree = useCallback(() => {
    setPoints(prev => {
      if (prev < 50) return prev;
      setTreeGrowth(g => g + 1);
      return prev - 50;
    });
  }, []);

  // ===== Render =====
  if (type === 'schedule') {
    return (
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
      />
    );
  }

  if (type === 'exercise') {
    return (
      <ExerciseSidebarContent
        knowledgeGraph={knowledgeGraph}
        dynamicExercises={dynamicExercises}
        currentExerciseIndex={currentExerciseIndex}
        exerciseAnswers={exerciseAnswers}
        showExerciseResult={showExerciseResult}
        onCurrentExerciseIndexChange={setCurrentExerciseIndex}
        onExerciseAnswersChange={setExerciseAnswers}
        onShowExerciseResultChange={setShowExerciseResult}
        onDynamicExercisesChange={setDynamicExercises}
      />
    );
  }

  if (type === 'focus') {
    return <FocusSidebarContent focus={focus} audioRef={audioRef} />;
  }

  if (type === 'achievements') {
    return (
      <AchievementsSidebarContent
        points={points}
        level={level}
        treeGrowth={treeGrowth}
        dailyTasks={dailyTasks}
        achievements={achievements.achievements}
        onCompleteTask={completeTask}
        onWaterTree={waterTree}
      />
    );
  }

  if (type === 'homework') {
    return <HomeworkPanel homework={homework} />;
  }

  return null;
}

// ===== 作业面板（v2 新建，风格与 v1 一致）=====

function HomeworkPanel({ homework }: { homework: UseHomeworkReturn }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    subject: '数学',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '🔴 待完成', color: 'bg-magic-accent/20 text-magic-accent' },
    in_progress: { label: '🟡 进行中', color: 'bg-blue-500/20 text-blue-400' },
    completed: { label: '🟢 已完成', color: 'bg-emerald-500/20 text-emerald-400' },
    overdue: { label: '⚠️ 已逾期', color: 'bg-red-500/20 text-red-400' },
  };

  const subjects = ['数学', '语文', '英语', '科学', '其他'];

  const handleAdd = () => {
    if (!newTask.title.trim()) return;
    homework.addTask({
      subject: newTask.subject,
      title: newTask.title.trim(),
      status: 'pending',
      dueDate: newTask.dueDate,
      image: null,
    });
    setNewTask({ subject: '数学', title: '', dueDate: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  const cycleStatus = (id: string, currentStatus: string) => {
    const order = ['pending', 'in_progress', 'completed'];
    const idx = order.indexOf(currentStatus === 'overdue' ? 'pending' : currentStatus);
    const next = order[(idx + 1) % order.length];
    homework.updateTaskStatus(id, next as any);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 标题栏 */}
      <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-serif font-bold text-white mb-1">📝 魔法作业本</h3>
          <p className="text-xs text-white/40">记录作业，打败拖延怪兽！</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "p-2 rounded-xl transition-all border",
            isAdding ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-magic-accent/20 border-magic-accent/30 text-magic-accent hover:bg-magic-accent/30"
          )}
        >
          {isAdding ? '✕' : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* 添加作业表单 */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 overflow-hidden"
        >
          <div className="flex gap-2">
            <select
              value={newTask.subject}
              onChange={e => setNewTask({ ...newTask, subject: e.target.value })}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
            />
          </div>
          <input
            type="text"
            placeholder="作业内容（如：练习册 P50-52）"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="w-full py-2 bg-magic-accent text-white rounded-lg text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            添加作业
          </button>
        </motion.div>
      )}

      {/* 筛选栏 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'all', label: '全部' },
          { value: 'pending', label: '待完成' },
          { value: 'in_progress', label: '进行中' },
          { value: 'completed', label: '已完成' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => homework.setFilter(f.value as any)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
              homework.filter === f.value ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 作业列表 */}
      <div className="space-y-2">
        {homework.tasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-magic-accent/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-magic-accent" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">暂无作业</h4>
              <p className="text-[10px] text-white/40 mt-1">点击右上角 + 添加新作业</p>
            </div>
          </div>
        ) : (
          homework.tasks.map(task => {
            const config = statusConfig[task.status] || statusConfig.pending;
            return (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-all"
              >
                <button
                  onClick={() => cycleStatus(task.id, task.status)}
                  className="flex-shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/20 hover:text-magic-accent transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{task.subject}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", config.color)}>
                      {config.label}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm text-white truncate",
                    task.status === 'completed' && "line-through opacity-60"
                  )}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" /> {task.dueDate}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => homework.deleteTask(task.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
