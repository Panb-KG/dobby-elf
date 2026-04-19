"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, X } from 'lucide-react';
import { Course } from '../../services/types';

interface CourseModuleProps {
  courses: Course[];
  scheduleView: 'week' | 'day';
  selectedDay: string;
  isAddingCourse: boolean;
  newCourse: Omit<Course, 'id' | 'color'>;
  onScheduleViewChange: (view: 'week' | 'day') => void;
  onSelectedDayChange: (day: string) => void;
  onIsAddingCourseChange: (adding: boolean) => void;
  onNewCourseChange: (course: Omit<Course, 'id' | 'color'>) => void;
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
}

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function CourseModule({
  courses,
  scheduleView,
  selectedDay,
  isAddingCourse,
  newCourse,
  onScheduleViewChange,
  onSelectedDayChange,
  onIsAddingCourseChange,
  onNewCourseChange,
  onAddCourse,
  onRemoveCourse,
}: CourseModuleProps) {
  const filteredCourses = scheduleView === 'day'
    ? courses.filter(c => c.day === selectedDay)
    : courses;

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* 视图切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => onScheduleViewChange('week')}
          className={`flex-1 py-2 rounded-xl transition-colors ${
            scheduleView === 'week' ? 'bg-magic-accent text-white' : 'glass-panel text-white/60'
          }`}
        >
          周视图
        </button>
        <button
          onClick={() => onScheduleViewChange('day')}
          className={`flex-1 py-2 rounded-xl transition-colors ${
            scheduleView === 'day' ? 'bg-magic-accent text-white' : 'glass-panel text-white/60'
          }`}
        >
          日视图
        </button>
      </div>

      {/* 日视图选择器 */}
      {scheduleView === 'day' && (
        <div className="flex gap-2 overflow-x-auto">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => onSelectedDayChange(day)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                selectedDay === day ? 'bg-magic-accent text-white' : 'glass-panel text-white/60'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* 课程列表 */}
      <div className="space-y-2">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-xl border-l-4 ${course.color || 'bg-white/5 border-white/20'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white">{course.subject}</h3>
                <p className="text-sm text-white/60">{course.time}</p>
                <span className="text-xs text-white/40">{course.type}</span>
              </div>
              <button
                onClick={() => onRemoveCourse(index)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 添加课程表单 */}
      {isAddingCourse && (
        <div className="glass-panel p-4 rounded-xl space-y-3">
          <input
            type="text"
            placeholder="科目名称"
            value={newCourse.subject}
            onChange={(e) => onNewCourseChange({ ...newCourse, subject: e.target.value })}
            className="w-full bg-black/40 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-magic-accent"
          />
          <input
            type="time"
            value={newCourse.time}
            onChange={(e) => onNewCourseChange({ ...newCourse, time: e.target.value })}
            className="w-full bg-black/40 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-magic-accent"
          />
          <select
            value={newCourse.type}
            onChange={(e) => onNewCourseChange({ ...newCourse, type: e.target.value as '校内' | '课外' })}
            className="w-full bg-black/40 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-magic-accent"
          >
            <option value="校内">校内</option>
            <option value="课外">课外</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={onAddCourse}
              className="flex-1 py-2 bg-magic-accent text-white rounded-xl font-bold"
            >
              添加
            </button>
            <button
              onClick={() => onIsAddingCourseChange(false)}
              className="flex-1 py-2 glass-panel text-white/60 rounded-xl"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 添加按钮 */}
      {!isAddingCourse && (
        <button
          onClick={() => onIsAddingCourseChange(true)}
          className="w-full py-3 glass-panel rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
        >
          <Plus className="w-5 h-5 text-white/60" />
          <span className="text-white/60">添加课程</span>
        </button>
      )}
    </div>
  );
}
