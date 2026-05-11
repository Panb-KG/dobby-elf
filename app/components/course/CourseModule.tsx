"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, X, Camera, Loader2 } from 'lucide-react';
import { error as logError } from '../../lib/console';
import type { Course, ScheduleView } from '../../types';

export interface CourseModuleProps {
  courses: Course[];
  scheduleView: ScheduleView;
  selectedDay: string;
  isAddingCourse: boolean;
  newCourse: Omit<Course, 'id' | 'color'>;
  userId: string;
  onScheduleViewChange: (view: ScheduleView) => void;
  onSelectedDayChange: (day: string) => void;
  onIsAddingCourseChange: (adding: boolean) => void;
  onNewCourseChange: (course: Omit<Course, 'id' | 'color'>) => void;
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
  onCoursesChange?: (courses: Course[]) => void;
}

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function CourseModule({
  courses,
  scheduleView,
  selectedDay,
  isAddingCourse,
  newCourse,
  userId,
  onScheduleViewChange,
  onSelectedDayChange,
  onIsAddingCourseChange,
  onNewCourseChange,
  onAddCourse,
  onRemoveCourse,
  onCoursesChange,
}: CourseModuleProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    try {
      // 读取图片为 base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        // 移除 data:image/...;base64, 前缀
        const imageData = base64.split(',')[1];

        // 调用识别 API
        const res = await fetch('/api/courses/parse-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '识别失败');
        }

        if (!data.courses || data.courses.length === 0) {
          setParseError('未识别到课程信息，请确认图片清晰且包含课表');
          setIsParsing(false);
          return;
        }

        // 批量保存识别到的课程（通过 API）
        const savedCourses: Course[] = [];

        for (const course of data.courses) {
          const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              course: {
                day: course.day,
                subject: course.subject,
                time: course.time,
                type: course.type,
                color: '',
              },
            }),
          });

          if (res.ok) {
            const result = await res.json();
            savedCourses.push({
              id: result.id,
              day: course.day,
              subject: course.subject,
              time: course.time,
              type: course.type,
              color: '',
            });
          }
        }

        // 通知父组件更新
        if (onCoursesChange && savedCourses.length > 0) {
          onCoursesChange([...courses, ...savedCourses]);
        }

        setIsParsing(false);
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      logError('Upload error:', err);
      setParseError((err instanceof Error && err.message) || '上传失败');
      setIsParsing(false);
    }
  };

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

      {/* 图片识别上传 */}
      <div className="space-y-2">
        <label className="w-full py-3 glass-panel rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
          <Camera className="w-5 h-5 text-white/60" />
          <span className="text-white/60">上传课表图片识别</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isParsing}
          />
        </label>
        {isParsing && (
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>正在识别课表...</span>
          </div>
        )}
        {parseError && (
          <div className="text-red-400 text-sm text-center">{parseError}</div>
        )}
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
