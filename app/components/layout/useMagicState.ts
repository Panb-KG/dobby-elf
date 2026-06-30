"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { User, Spell, KnowledgePoint, DailyTask } from '../../types';
import type { UseChatReturn } from '../../hooks/useChat';
import type { UseCoursesReturn } from '../../hooks/useCourses';
import type { UseFocusReturn } from '../../hooks/useFocus';

interface UseMagicStateParams {
  user: User;
  course: UseCoursesReturn;
  focus: UseFocusReturn;
  chat: UseChatReturn;
  onRightSidebarChange: (open: boolean) => void;
  onSidebarContentTypeChange: (type: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content') => void;
  shortcuts: Spell[];
}

export function useMagicState(params: UseMagicStateParams) {
  const { user, course, focus, chat, onRightSidebarChange, onSidebarContentTypeChange } = params;

  const [knowledgeGraph] = useState<KnowledgePoint[]>([
    { name: '分数乘法', status: 'mastered', subject: '数学' },
    { name: '过去进行时', status: 'learning', subject: '英语' },
    { name: '古诗词鉴赏', status: 'learning', subject: '语文' },
  ]);
  const [dynamicExercises, setDynamicExercises] = useState<any>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showExerciseResult, setShowExerciseResult] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [activeReminder, setActiveReminder] = useState<{ subject: string; time: string } | null>(null);
  const [showDailyAdventure, setShowDailyAdventure] = useState(true);
  const [points, setPoints] = useState(user.points || 1250);
  const [level, setLevel] = useState(user.level || '魔法学徒');
  const [treeGrowth, setTreeGrowth] = useState(user.treeGrowth || 0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(user.dailyTasks || [
    { id: 'task1', text: '完成3道奥数题', completed: false, reward: 50 },
    { id: 'task2', text: '背诵5个新单词', completed: false, reward: 30 },
    { id: 'task3', text: '查看今日课程表', completed: false, reward: 10 },
  ]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 智能提醒系统
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

  // 白噪音逻辑
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
      if (audio.src !== targetUrl) { audio.src = targetUrl; audio.load(); }
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    return () => { audio.pause(); };
  }, [focus.whiteNoise]);

  // 标签页切换检测
  useEffect(() => {
    const handler = () => { if (document.hidden && focus.isFocusing) focus.pauseFocus(); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [focus.isFocusing, focus.pauseFocus]);

  // 用户数据同步
  useEffect(() => {
    setPoints(user.points || 1250);
    setLevel(user.level || '魔法学徒');
    setTreeGrowth(user.treeGrowth || 0);
    if (user.dailyTasks && user.dailyTasks.length > 0) setDailyTasks(user.dailyTasks);
  }, [user]);

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
    setDailyTasks(newTasks); setPoints(newPoints); setLevel(newLevel);
  }, [dailyTasks, points, level]);

  const waterTree = useCallback(() => {
    if (points < 50) return;
    setPoints(prev => prev - 50);
    setTreeGrowth(prev => prev + 1);
  }, [points]);

  const useSpell = useCallback((spell: Spell) => {
    chat.handleShortcut(spell.prompt);
    if (spell.id === 'schedule') { onRightSidebarChange(true); onSidebarContentTypeChange('schedule'); }
    else if (spell.id === 'homework' || spell.id === 'math') { onRightSidebarChange(true); onSidebarContentTypeChange('exercise'); }
    else if (spell.id === 'achievements') { onRightSidebarChange(true); onSidebarContentTypeChange('achievements'); }
    else if (spell.id === 'focus') { onRightSidebarChange(true); onSidebarContentTypeChange('focus'); }
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

  const shortcutButtons = useMemo(() => params.shortcuts.map(spell => ({
    id: spell.id, name: spell.name, prompt: spell.prompt,
  })), [params.shortcuts]);

  return {
    knowledgeGraph, dynamicExercises, setDynamicExercises,
    currentExerciseIndex, setCurrentExerciseIndex,
    exerciseAnswers, setExerciseAnswers,
    showExerciseResult, setShowExerciseResult,
    generatedImage, setGeneratedImage,
    selectedContent, contentTitle,
    activeReminder, setActiveReminder,
    showDailyAdventure, setShowDailyAdventure,
    points, level, treeGrowth, dailyTasks,
    audioRef, completeTask, waterTree, useSpell,
    isComplexContent, handleComplexContentClick, shortcutButtons,
  };
}
