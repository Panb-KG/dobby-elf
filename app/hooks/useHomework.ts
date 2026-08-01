"use client";

import { useState, useCallback, useEffect } from 'react';
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
  userId?: string;
}

const USE_SUPABASE = true;

/**
 * 作业管理 Hook
 * 
 * 功能：
 * - 作业任务 CRUD
 * - 状态管理（待完成/进行中/已完成）
 * - 按科目筛选
 * - 逾期检测
 * - 从 Supabase 加载 & 同步写入
 */
export function useHomework(options: UseHomeworkOptions = {}): UseHomeworkReturn {
  const { initialTasks = [], userId } = options;
  const [tasks, setTasks] = useLocalStorage<HomeworkTask[]>({
    key: StorageKeys.HOMEWORK,
    defaultValue: initialTasks,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<HomeworkStatus | 'all'>('all');

  // 离线同步 — 传入真实 userId
  const { sync } = useSync({ userId: userId || '', enabled: USE_SUPABASE && !!userId });

  // 从 Supabase 加载作业
  useEffect(() => {
    if (!USE_SUPABASE || !userId) return;
    const loadHomework = async () => {
      try {
        const res = await fetch(`/api/supabase?type=homework&user_id=${userId}`);
        if (res.ok) {
          const data: Record<string, unknown>[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const converted: HomeworkTask[] = data.map(row => ({
              id: row.id as string,
              subject: (row.subject as string) || '其他',
              title: row.title as string,
              status: ((row.status as string) || 'pending') as HomeworkStatus,
              dueDate: (row.due_date as string) || '',
              image: (row.image as string) || null,
            }));
            setTasks(converted);
          }
        }
      } catch { /* fallback to local */ }
    };
    loadHomework();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTask = useCallback((task: Omit<HomeworkTask, 'id'>) => {
    const newTask: HomeworkTask = {
      ...task,
      id: `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setTasks(prev => [...prev, newTask]);
    
    // 同步到服务器（使用数据库字段名）
    if (USE_SUPABASE && userId) {
      sync('homework', {
        type: 'create',
        data: {
          subject: newTask.subject,
          title: newTask.title,
          status: newTask.status,
          due_date: newTask.dueDate || null,
          image: newTask.image || null,
        },
      }).catch(() => {});
    }
  }, [sync, userId]);

  const updateTaskStatus = useCallback((id: string, status: HomeworkStatus) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, status } : task))
    );
    // 同步状态更新到服务器
    if (USE_SUPABASE && userId) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        sync('homework', {
          type: 'update',
          data: {
            id,
            subject: task.subject,
            title: task.title,
            status,
            due_date: task.dueDate || null,
            image: task.image || null,
          },
        }).catch(() => {});
      }
    }
  }, [sync, userId, tasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task && USE_SUPABASE && userId) {
        sync('homework', { type: 'delete', data: { id } }).catch(() => {});
      }
      return prev.filter(task => task.id !== id);
    });
  }, [sync, userId]);

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
