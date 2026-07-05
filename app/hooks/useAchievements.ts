"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useSync } from './useSync';
import { StorageKeys } from '../lib/storage';
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
  userId?: string;
}

const USE_SUPABASE = true;

const POINTS_MAP: Record<string, number> = {
  homework: 50, course: 20, exercise: 30, focus: 40, special: 100,
};

export function useAchievements(options: UseAchievementsOptions = {}): UseAchievementsReturn {
  const { initialAchievements = [], user, userId } = options;
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>({
    key: StorageKeys.ACHIEVEMENTS,
    defaultValue: initialAchievements,
  });

  const { sync } = useSync({ userId: userId || '', enabled: USE_SUPABASE && !!userId });

  // 从 Supabase 加载成就
  useEffect(() => {
    if (!USE_SUPABASE || !userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/supabase?type=achievements&user_id=${userId}`);
        if (res.ok) {
          const data: Record<string, unknown>[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const converted: Achievement[] = data.map(a => ({
              id: a.id as string,
              title: a.title as string,
              date: a.date as string,
              type: a.type as string,
              iconName: (a.icon_name as string) || 'Star',
              color: (a.color as string) || 'bg-yellow-500',
            }));
            setAchievements(converted);
          }
        }
      } catch { /* fallback to local */ }
    })();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addAchievement = useCallback((achievement: Omit<Achievement, 'id'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: `ach_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    };
    setAchievements(prev => [newAchievement, ...prev]);
    if (USE_SUPABASE && userId) {
      sync('achievements', {
        type: 'create',
        data: {
          title: newAchievement.title,
          date: newAchievement.date,
          type: newAchievement.type,
          icon_name: newAchievement.iconName,
          color: newAchievement.color,
        },
      }).catch(() => {});
    }
  }, [userId, sync]);

  const getAchievementsByType = useCallback(
    (type: string) => achievements.filter(ach => ach.type === type),
    [achievements]
  );

  const getAchievementsByDate = useCallback(
    (date: string) => achievements.filter(ach => ach.date.startsWith(date)),
    [achievements]
  );

  const totalPoints = useMemo(
    () => achievements.reduce((sum, ach) => sum + (POINTS_MAP[ach.type] || 10), 0),
    [achievements]
  );

  const userLevel = useMemo(() => {
    if (user?.level) return user.level;
    if (totalPoints < 1000) return '魔法学徒';
    if (totalPoints < 2000) return '初级魔法师';
    if (totalPoints < 3000) return '中级魔法师';
    if (totalPoints < 5000) return '高级魔法师';
    return '大魔法师';
  }, [totalPoints, user?.level]);

  const recentAchievements = useMemo(
    () => [...achievements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10),
    [achievements]
  );

  return {
    achievements, totalPoints, userLevel, recentAchievements,
    addAchievement, getAchievementsByType, getAchievementsByDate,
  };
}
