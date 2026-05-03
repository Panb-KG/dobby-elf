"use client";

/**
 * useSmartReminder - 智能课程提醒 Hook
 * 
 * 每分钟检查一次，如果当前日有课程将在 1-5 分钟内开始，触发提醒。
 */

import { useState, useEffect, useCallback } from 'react';
import type { Course } from '../types';

export interface ActiveReminder {
  subject: string;
  time: string;
}

export interface UseSmartReminderReturn {
  activeReminder: ActiveReminder | null;
  dismissReminder: () => void;
}

export function useSmartReminder(courses: Course[]): UseSmartReminderReturn {
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);

  const dismissReminder = useCallback(() => {
    setActiveReminder(null);
  }, []);

  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const currentDay = days[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const course of courses) {
        if (course.day !== currentDay) continue;

        const startTime = course.time.split(' - ')[0];
        if (!startTime) continue;

        const [h, m] = startTime.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) continue;

        const courseDate = new Date();
        courseDate.setHours(h, m, 0, 0);
        const diff = (courseDate.getTime() - now.getTime()) / (1000 * 60);

        if (diff > 0 && diff <= 5) {
          setActiveReminder({ subject: course.subject, time: startTime });
          return;
        }
      }

      // 没有需要提醒的课程，清除旧提醒
      setActiveReminder(prev => {
        if (prev) return null;
        return prev;
      });
    };

    // 立即检查一次
    checkReminder();

    // 每分钟检查一次
    const timer = setInterval(checkReminder, 60000);
    return () => clearInterval(timer);
  }, [courses]);

  return { activeReminder, dismissReminder };
}
