"use client";

/**
 * ClassicPanels - v2.0 包装组件
 * 将 v1 的课程表/练习题/专注/成就面板整合到 v2 三栏布局中
 * 内部管理所有状态，对外只需 type + userId
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useHomework } from '@/hooks/useHomework';
import { useFocus } from '@/hooks/useFocus';
import { useAchievements } from '@/hooks/useAchievements';
import {
  CourseSidebarContent,
  ExerciseSidebarContent,
  AchievementsSidebarContent,
  FocusSidebarContent,
} from '@/components/RightSidebarContent';
import { HomeworkPanel } from './HomeworkPanel';
import type { KnowledgePoint, DailyTask } from '@/types';

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

