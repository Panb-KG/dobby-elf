/**
 * 课程表侧边栏组件
 */

"use client";

import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Course } from '../../types';
import { XIcon, PlusIcon } from './SharedIcons';

export interface CourseSidebarProps {
  courses: Course[];
  scheduleView: 'week' | 'day';
  selectedDay: string;
  isAddingCourse: boolean;
  newCourse: { day: string; subject: string; time: string; type: '校内' | '课外' };
  onScheduleViewChange: (view: 'week' | 'day') => void;
  onSelectedDayChange: (day: string) => void;
  onIsAddingCourseChange: (adding: boolean) => void;
  onNewCourseChange: (course: { day: string; subject: string; time: string; type: '校内' | '课外' }) => void;
  onAddCourse: () => void;
}

export function CourseSidebarContent({
  courses, scheduleView, selectedDay, isAddingCourse, newCourse,
  onScheduleViewChange, onSelectedDayChange, onIsAddingCourseChange,
  onNewCourseChange, onAddCourse,
}: CourseSidebarProps) {
  const courseColors = [
    'bg-blue-500/20 border-blue-500/30', 'bg-purple-500/20 border-purple-500/30',
    'bg-amber-500/20 border-amber-500/30', 'bg-emerald-500/20 border-emerald-500/30',
    'bg-rose-500/20 border-rose-500/30', 'bg-sky-500/20 border-sky-500/30',
    'bg-indigo-500/20 border-indigo-500/30',
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      <div className="sticky top-0 z-20 pt-1 pb-4 space-y-4">
        <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5">
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-1">我的魔法课程表</h3>
            <p className="text-xs text-white/40">2026年3月 · 第一周</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onIsAddingCourseChange(!isAddingCourse)} className={cn(
              "p-2 rounded-xl transition-all border",
              isAddingCourse ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-magic-accent/20 border-magic-accent/30 text-magic-accent hover:bg-magic-accent/30"
            )}>
              {isAddingCourse ? <XIcon /> : <PlusIcon />}
            </button>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(['week', 'day'] as const).map(view => (
                <button key={view} onClick={() => onScheduleViewChange(view)} className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  scheduleView === view ? "bg-magic-accent text-white shadow-lg" : "text-white/40 hover:text-white/60"
                )}>{view === 'week' ? '周' : '日'}</button>
              ))}
            </div>
          </div>
        </div>
        {isAddingCourse && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-2">
              <select value={newCourse.day} onChange={(e) => onNewCourseChange({ ...newCourse, day: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50">
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={newCourse.type} onChange={(e) => onNewCourseChange({ ...newCourse, type: e.target.value as '校内' | '课外' })} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50">
                <option value="校内">校内</option><option value="课外">课外</option>
              </select>
            </div>
            <input type="text" placeholder="课程名称" value={newCourse.subject} onChange={(e) => onNewCourseChange({ ...newCourse, subject: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50" />
            <input type="text" placeholder="时间 (如: 09:00 - 10:30)" value={newCourse.time} onChange={(e) => onNewCourseChange({ ...newCourse, time: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50" />
            <button onClick={onAddCourse} className="w-full py-2 bg-magic-accent text-white rounded-lg text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all">添加魔法课程</button>
          </motion.div>
        )}
        {scheduleView === 'day' && (
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar">
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
              <button key={day} onClick={() => onSelectedDayChange(day)} className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all border",
                selectedDay === day ? "bg-white/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
              )}>{day}</button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 mt-4">
        {courses.filter(item => scheduleView === 'week' || item.day === selectedDay).map((item, idx) => (
          <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={`${item.day}-${item.subject}-${idx}`} className={cn("p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-default", item.color || courseColors[idx % courseColors.length])}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.day}</span>
                <h4 className="font-medium text-white">{item.subject}</h4>
              </div>
              <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", item.type === '校内' ? "bg-white/10 text-white/60" : "bg-magic-accent/20 text-magic-accent")}>{item.type}</span>
            </div>
            <span className="text-xs text-white/40 font-mono">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
