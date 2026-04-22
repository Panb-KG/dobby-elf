"use client";

import { useState, useCallback, useMemo } from 'react';
import type { Achievement, User } from '../types';

export interface UseAchievementsReturn {
  achievements: Achievement[];
  totalPoints: number;
  userLevel: string;
  recentAchievements: Achievement[];
  addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
  getAchievementsByType: (type: string) => Achievement[];
  getAchievementsByDate: (date: string) => Achievement[];
}

export interface UseAchievementsOptions {
  initialAchievements?: Achievement[];
  user?: User | null;
}

/**
 * 成就系统 Hook
 * 
 * 功能：
 * - 成就列表管理
 * - 积分计算
 * - 等级追踪
 * - 按类型/日期筛选
 * 
 * @example
 * ```tsx
 * const { achievements, totalPoints, addAchievement } = useAchievements();
 * 
 * addAchievement({
 *   title: '完成第一次作业',
 *   date: new Date().toISOString(),
 *   type: 'homework',
 *   iconName: 'CheckCircle',
 *   color: 'bg-green-500',
 * });
 * ```
 */
export function useAchievements(options: UseAchievementsOptions = {}): UseAchievementsReturn {
  const { initialAchievements = [], user } = options;
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);

  const addAchievement = useCallback((achievement: Omit<Achievement, 'id'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setAchievements(prev => [newAchievement, ...prev]);
  }, []);

  const getAchievementsByType = useCallback(
    (type: string) => {
      return achievements.filter(ach => ach.type === type);
    },
    [achievements]
  );

  const getAchievementsByDate = useCallback(
    (date: string) => {
      return achievements.filter(ach => ach.date.startsWith(date));
    },
    [achievements]
  );

  const totalPoints = useMemo(() => {
    // 根据成就类型计算积分
    const pointsMap: Record<string, number> = {
      homework: 50,
      course: 20,
      exercise: 30,
      focus: 40,
      special: 100,
    };
    
    return achievements.reduce((sum, ach) => {
      return sum + (pointsMap[ach.type] || 10);
    }, 0);
  }, [achievements]);

  const userLevel = useMemo(() => {
    if (user?.level) return user.level;
    
    // 根据积分计算等级
    if (totalPoints < 1000) return '魔法学徒';
    if (totalPoints < 2000) return '初级魔法师';
    if (totalPoints < 3000) return '中级魔法师';
    if (totalPoints < 5000) return '高级魔法师';
    return '大魔法师';
  }, [totalPoints, user?.level]);

  const recentAchievements = useMemo(() => {
    return achievements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [achievements]);

  return {
    achievements,
    totalPoints,
    userLevel,
    recentAchievements,
    addAchievement,
    getAchievementsByType,
    getAchievementsByDate,
  };
}
