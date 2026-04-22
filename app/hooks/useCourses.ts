"use client";

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { StorageKeys } from '../lib/storage';
import type { Course, ScheduleView } from '../types';

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

export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
  const { initialCourses = [], defaultView = 'week' } = options;
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

  const addCourse = useCallback(() => {
    if (!newCourse.subject || !newCourse.time) return;
    
    const colorIndex = courses.length % COURSE_COLORS.length;
    const course: Course = {
      ...newCourse,
      color: COURSE_COLORS[colorIndex],
    };
    
    setCourses(prev => [...prev, course]);
    setNewCourse({ day: selectedDay, subject: '', time: '', type: '校内' });
    setIsAddingCourse(false);
  }, [newCourse, courses.length, selectedDay]);

  const removeCourse = useCallback((index: number) => {
    setCourses(prev => prev.filter((_, i) => i !== index));
  }, []);

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
