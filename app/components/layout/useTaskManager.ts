"use client";

import { useState, useEffect, useCallback } from 'react';
import type { User, DailyTask } from '../../types';

/**
 * useTaskManager - 积分/等级/任务管理
 * 处理任务完成、浇水、等级升级逻辑
 */
export function useTaskManager(user: User) {
  const [points, setPoints] = useState(user.points || 1250);
  const [level, setLevel] = useState(user.level || '魔法学徒');
  const [treeGrowth, setTreeGrowth] = useState(user.treeGrowth || 0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(
    user.dailyTasks && user.dailyTasks.length > 0
      ? user.dailyTasks
      : [
          { id: 'task1', text: '完成3道奥数题', completed: false, reward: 50 },
          { id: 'task2', text: '背诵5个新单词', completed: false, reward: 30 },
          { id: 'task3', text: '查看今日课程表', completed: false, reward: 10 },
        ],
  );

  // 用户数据同步
  useEffect(() => {
    setPoints(user.points || 1250);
    setLevel(user.level || '魔法学徒');
    setTreeGrowth(user.treeGrowth || 0);
    if (user.dailyTasks && user.dailyTasks.length > 0) {
      setDailyTasks(user.dailyTasks);
    }
  }, [user]);

  const completeTask = useCallback(async (taskId: string) => {
    setDailyTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task || task.completed) return prev;
      const newTasks = prev.map(t =>
        t.id === taskId ? { ...t, completed: true } : t,
      );
      const newPoints = points + task.reward;
      let newLevel = level;
      if (newPoints >= 5000) newLevel = '大魔法师';
      else if (newPoints >= 3000) newLevel = '高级魔法师';
      else if (newPoints >= 2000) newLevel = '中级魔法师';
      else if (newPoints >= 1000) newLevel = '初级魔法师';
      setPoints(newPoints);
      setLevel(newLevel);
      return newTasks;
    });
  }, [points, level]);

  const waterTree = useCallback(() => {
    setPoints(prev => {
      if (prev < 50) return prev;
      setTreeGrowth(g => g + 1);
      return prev - 50;
    });
  }, []);

  return { points, level, treeGrowth, dailyTasks, completeTask, waterTree };
}
