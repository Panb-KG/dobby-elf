"use client";

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { StorageKeys } from '../lib/storage';
import type { Course, ScheduleView } from '../types';

// 是否使用 Supabase 作为数据源
const USE_SUPABASE = true;

export interface UseCoursesReturn {
  courses: Course[];
  scheduleView: ScheduleView;
  selectedDay: string;
  isAddingCourse: boolean;
  newCourse: Omit<Course, 'id' | 'color'> & { color?: string };
  setScheduleView: (view: ScheduleView) => void;
  setSelectedDay: (day: string) => void;
  setIsAddingCourse: (adding: boolean) => void;
  setNewCourse: (course: Omit<Course, 'id' | 'color'> & { color?: string }) => void;
  addCourse: () => void;
  removeCourse: (index: number) => void;
}

export interface UseCoursesOptions {
  initialCourses?: Course[];
  defaultView?: ScheduleView;
  userId?: string;
}

const COURSE_COLORS = [
  'bg-blue-500/20 border-blue-500/30',
  'bg-sky-500/20 border-sky-500/30',
  'bg-purple-500/20 border-purple-500/30',
  'bg-orange-500/20 border-orange-500/30',
  'bg-amber-500/20 border-amber-500/30',
  'bg-green-500/20 border-green-500/30',
  'bg-emerald-500/20 border-emerald-500/30',
  'bg-slate-500/20 border-slate-500/30',
  'bg-rose-500/20 border-rose-500/30',
  'bg-yellow-500/20 border-yellow-500/30',
  'bg-red-500/20 border-red-500/30',
  'bg-indigo-500/20 border-indigo-500/30',
  'bg-cyan-500/20 border-cyan-500/30',
  'bg-lime-500/20 border-lime-500/30',
];

// 星期映射
const DAY_MAP: Record<string, number> = {
  '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7,
};
const DAY_REVERSE_MAP: Record<number, string> = {
  1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日',
};

export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
  const { initialCourses = [], defaultView = 'week', userId } = options;
  const [courses, setCourses] = useLocalStorage<Course[]>({
    key: StorageKeys.COURSES,
    defaultValue: initialCourses,
  });
  const [scheduleView, setScheduleView] = useState<ScheduleView>(defaultView);
  const [selectedDay, setSelectedDay] = useState('周一');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id' | 'color'> & { color?: string }>({
    day: '周一',
    subject: '',
    time: '',
    type: '校内',
  });

  // 从 Supabase 加载课程
  useEffect(() => {
    if (!USE_SUPABASE || !userId) return;
    
    const loadCourses = async () => {
      try {
        const response = await fetch(`/api/supabase?type=courses&user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // 将 Supabase 格式转换为前端格式
            const converted: Course[] = data.map((c: any) => ({
              id: c.id,
              day: DAY_REVERSE_MAP[c.day_of_week] || '周一',
              subject: c.name,
              time: `${c.start_time?.substring(0, 5) || ''}-${c.end_time?.substring(0, 5) || ''}`,
              type: (c as any).location === '课外' ? '课外' : '校内',
              color: c.color || COURSE_COLORS[0],
            }));
            setCourses(converted);
          }
        }
      } catch (err) {
        console.warn('从 Supabase 加载课程失败，使用本地数据:', err);
      }
    };

    loadCourses();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addCourse = useCallback(() => {
    if (!newCourse.subject || !newCourse.time) return;
    
    const colorIndex = courses.length % COURSE_COLORS.length;
    const course: Course = {
      ...newCourse,
      color: COURSE_COLORS[colorIndex],
    };
    
    setCourses(prev => [...prev, course]);
    
    // 同步到 Supabase
    if (USE_SUPABASE && userId) {
      const [startTime, endTime] = newCourse.time.split('-');
      fetch('/api/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'course',
          user_id: userId,
          name: newCourse.subject,
          day_of_week: DAY_MAP[newCourse.day] || 1,
          start_time: startTime || '08:00',
          end_time: endTime || '09:00',
          color: COURSE_COLORS[colorIndex],
        }),
      }).catch(() => {});
    }
    
    setNewCourse({ day: selectedDay, subject: '', time: '', type: '校内' });
    setIsAddingCourse(false);
  }, [newCourse, courses.length, selectedDay, userId]);

  const removeCourse = useCallback((index: number) => {
    const removed = courses[index];
    setCourses(prev => prev.filter((_, i) => i !== index));
    
    // 从 Supabase 删除
    if (USE_SUPABASE && removed?.id) {
      fetch(`/api/supabase?id=${removed.id}&type=course`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  }, [courses]);

  return {
    courses,
    scheduleView,
    selectedDay,
    isAddingCourse,
    newCourse,
    setScheduleView,
    setSelectedDay,
    setIsAddingCourse,
    setNewCourse,
    addCourse,
    removeCourse,
  };
}
