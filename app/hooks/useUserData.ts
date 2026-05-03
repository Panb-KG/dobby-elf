"use client";

/**
 * useUserData - 用户数据管理 Hook
 * 
 * 管理积分、等级、知识之树、每日任务。
 */

import { useState, useCallback, useEffect } from 'react';
import type { User, DailyTask } from '../types';

export interface UseUserDataReturn {
  points: number;
  level: string;
  treeGrowth: number;
  dailyTasks: DailyTask[];
  completeTask: (taskId: string) => void;
  waterTree: () => boolean;
  addPoints: (amount: number) => void;
}

const LEVEL_THRESHOLDS = [
  { min: 5000, level: '大魔法师' },
  { min: 3000, level: '高级魔法师' },
  { min: 2000, level: '中级魔法师' },
  { min: 1000, level: '初级魔法师' },
  { min: 0, level: '魔法学徒' },
];

function calcLevel(points: number): string {
  for (const t of LEVEL_THRESHOLDS) {
    if (points >= t.min) return t.level;
  }
  return '魔法学徒';
}

export function useUserData(user: User): UseUserDataReturn {
  const [points, setPoints] = useState(user.points ?? 1250);
  const [level, setLevel] = useState(user.level ?? '魔法学徒');
  const [treeGrowth, setTreeGrowth] = useState(user.treeGrowth ?? 0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(
    user.dailyTasks ?? [
      { id: 'task1', text: '完成3道奥数题', completed: false, reward: 50 },
      { id: 'task2', text: '背诵5个新单词', completed: false, reward: 30 },
      { id: 'task3', text: '查看今日课程表', completed: false, reward: 10 },
    ]
  );

  // 同步 user 变化
  useEffect(() => {
    setPoints(user.points ?? 1250);
    setLevel(user.level ?? '魔法学徒');
    setTreeGrowth(user.treeGrowth ?? 0);
    if (user.dailyTasks && user.dailyTasks.length > 0) {
      setDailyTasks(user.dailyTasks);
    }
  }, [user]);

  const completeTask = useCallback((taskId: string) => {
    setDailyTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task || task.completed) return prev;

      const newTasks = prev.map(t => (t.id === taskId ? { ...t, completed: true } : t));
      const newPoints = points + task.reward;
      setPoints(newPoints);
      setLevel(calcLevel(newPoints));
      return newTasks;
    });
  }, [points]);

  const waterTree = useCallback((): boolean => {
    if (points < 50) return false;
    setPoints(prev => prev - 50);
    setTreeGrowth(prev => prev + 1);
    return true;
  }, [points]);

  const addPoints = useCallback((amount: number) => {
    setPoints(prev => {
      const newPoints = prev + amount;
      setLevel(calcLevel(newPoints));
      return newPoints;
    });
  }, []);

  return { points, level, treeGrowth, dailyTasks, completeTask, waterTree, addPoints };
}
