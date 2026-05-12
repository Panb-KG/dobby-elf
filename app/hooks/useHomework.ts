"use client";

import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useSync } from './useSync';
import { StorageKeys } from '../lib/storage';
import type { HomeworkTask, HomeworkStatus, HomeworkType } from '../types';

export interface UseHomeworkReturn {
  tasks: HomeworkTask[];
  isLoading: boolean;
  filter: HomeworkStatus | 'all';
  setFilter: (filter: HomeworkStatus | 'all') => void;
  addTask: (task: Omit<HomeworkTask, 'id'>) => void;
  updateTaskStatus: (id: string, status: HomeworkStatus) => void;
  deleteTask: (id: string) => void;
  getTasksBySubject: (subject: string) => HomeworkTask[];
  getOverdueTasks: () => HomeworkTask[];
}

export interface UseHomeworkOptions {
  initialTasks?: HomeworkTask[];
}

/**
 * 作业管理 Hook
 * 
 * 功能：
 * - 作业任务 CRUD
 * - 状态管理（待完成/进行中/已完成）
 * - 按科目筛选
 * - 逾期检测
 * 
 * @example
 * ```tsx
 * const { tasks, addTask, updateTaskStatus } = useHomework();
 * 
 * addTask({
 *   subject: '数学',
 *   title: '练习册 P50-52',
 *   status: 'pending',
 *   dueDate: '2026-04-25',
 *   image: null,
 * });
 * ```
 */
export function useHomework(options: UseHomeworkOptions = {}): UseHomeworkReturn {
  const { initialTasks = [] } = options;
  const [tasks, setTasks] = useLocalStorage<HomeworkTask[]>({
    key: StorageKeys.HOMEWORK,
    defaultValue: initialTasks,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<HomeworkStatus | 'all'>('all');

  // 离线同步
  const { sync } = useSync({ userId: 'local-user', enabled: true });

  const addTask = useCallback((task: Omit<HomeworkTask, 'id'>) => {
    const newTask: HomeworkTask = {
      ...task,
      id: `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setTasks(prev => [...prev, newTask]);
    
    // 同步到服务器
    sync('homework', { type: 'create', data: newTask }).catch(() => {});
  }, [sync]);

  const updateTaskStatus = useCallback((id: string, status: HomeworkStatus) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, status } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) {
        sync('homework', { type: 'delete', data: { id } }).catch(() => {});
      }
      return prev.filter(task => task.id !== id);
    });
  }, [sync]);

  const getTasksBySubject = useCallback(
    (subject: string) => {
      return tasks.filter(task => task.subject === subject);
    },
    [tasks]
  );

  const getOverdueTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(
      task => task.status !== 'completed' && task.dueDate < today
    );
  }, [tasks]);

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  return {
    tasks: filteredTasks,
    isLoading,
    filter,
    setFilter,
    addTask,
    updateTaskStatus,
    deleteTask,
    getTasksBySubject,
    getOverdueTasks,
  };
}
