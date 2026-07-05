"use client";

import { useState, useEffect } from 'react';
import type { Reminder, Course } from '../../types';

/**
 * useReminders - 智能课程提醒
 * 每分钟检查一次课程表，提前 5 分钟弹出提醒
 */
export function useReminders(courses: Course[]) {
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const currentDay = days[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      courses.forEach(c => {
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
  }, [courses]);

  return { activeReminder, setActiveReminder };
}
