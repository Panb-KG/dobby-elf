"use client";

/**
 * useMagicState - Hook 协调层
 * 仅负责组装各专用 hooks，不再包含业务逻辑
 */

import { useState, useCallback, useEffect } from 'react';
import type { User, Spell } from '../../types';
import type { UseChatReturn } from '../../hooks/useChat';
import type { UseCoursesReturn } from '../../hooks/useCourses';
import type { UseFocusReturn } from '../../hooks/useFocus';
import { useReminders } from './useReminders';
import { useWhiteNoise } from './useWhiteNoise';
import { useTaskManager } from './useTaskManager';
import { useSpellActions } from './useSpellActions';

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
  const { user, course, focus, chat, onRightSidebarChange, onSidebarContentTypeChange, shortcuts } = params;

  // 专用 hooks
  const reminders = useReminders(course.courses);
  const audioRef = useWhiteNoise(focus.whiteNoise);
  const tasks = useTaskManager(user);
  const spells = useSpellActions(chat, shortcuts, onRightSidebarChange, onSidebarContentTypeChange);

  // 标签页切换检测
  const handleVisibility = useCallback(() => {
    if (document.hidden && focus.isFocusing) {
      focus.pauseFocus();
    }
  }, [focus.isFocusing, focus.pauseFocus]);

  // 本地 UI 状态
  const [dynamicExercises, setDynamicExercises] = useState<any>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showExerciseResult, setShowExerciseResult] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [showDailyAdventure, setShowDailyAdventure] = useState(true);

  // 标签页切换检测
  useEffect(() => {
    const handler = () => {
      if (document.hidden && focus.isFocusing) {
        focus.pauseFocus();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [focus.isFocusing, focus.pauseFocus]);

  // 处理复杂内容点击（组合 spellActions + 本地状态）
  const handleComplexContentClick = useCallback(
    (text: string) => {
      const result = spells.handleComplexContentClick(text);
      setSelectedContent(result.selectedContent);
      setContentTitle(result.contentTitle);
    },
    [spells],
  );

  return {
    // Task manager
    points: tasks.points,
    level: tasks.level,
    treeGrowth: tasks.treeGrowth,
    dailyTasks: tasks.dailyTasks,
    completeTask: tasks.completeTask,
    waterTree: tasks.waterTree,
    // Reminders
    activeReminder: reminders.activeReminder,
    setActiveReminder: reminders.setActiveReminder,
    // Audio
    audioRef,
    // Exercises / image / content
    dynamicExercises,
    setDynamicExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    exerciseAnswers,
    setExerciseAnswers,
    showExerciseResult,
    setShowExerciseResult,
    generatedImage,
    setGeneratedImage,
    selectedContent,
    contentTitle,
    // Adventure
    showDailyAdventure,
    setShowDailyAdventure,
    // Knowledge graph (static for now)
    knowledgeGraph: [
      { name: '分数乘法', status: 'mastered' as const, subject: '数学' },
      { name: '过去进行时', status: 'learning' as const, subject: '英语' },
      { name: '古诗词鉴赏', status: 'learning' as const, subject: '语文' },
    ],
    // Spell actions
    useSpell: spells.useSpell,
    isComplexContent: spells.isComplexContent,
    handleComplexContentClick,
    shortcutButtons: spells.shortcutButtons,
    // Tab detection (expose for parent usage)
    handleVisibility,
  };
}
