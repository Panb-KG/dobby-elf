'use client';

/**
 * DailyAdventure - 今日冒险卡片
 * 
 * 孩子打开应用看到的第一件事：
 * 1. 多比的问候语（根据时间变化）
 * 2. 今日课程概览
 * 3. 今日任务清单
 * 4. 连续打卡天数
 * 5. 快速行动按钮
 * 
 * 设计理念：
 * - 像打开一本冒险日记
 * - 用emoji和颜色吸引注意力
 * - 信息简洁，不 overwhelming
 * - 鼓励为主，不是压力
 */

import React, { useMemo, memo } from 'react';
import { motion } from 'motion/react';
import {
  Sun, Moon, CloudSun, Sparkles, Flame, Star,
  Calendar, CheckCircle2, Circle, ArrowRight,
  BookOpen, Pencil, Trophy, Hourglass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DAILY_GREETINGS, DAILY_TASKS, WEEKDAYS, LEVELS } from '../lib/Global';
import type { Course, DailyTask } from '../types';

interface DailyAdventureProps {
  courses: Course[];
  dailyTasks: DailyTask[];
  points: number;
  level: string;
  streak: number; // 连续打卡天数
  onCompleteTask: (id: string) => void;
  onQuickAction: (action: string) => void;
}

export const DailyAdventure = memo(function DailyAdventure({
  courses,
  dailyTasks,
  points,
  level,
  streak,
  onCompleteTask,
  onQuickAction,
}: DailyAdventureProps) {
  // 根据时间获取问候语
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      const greetings = DAILY_GREETINGS.morning;
      return greetings[Math.floor(Math.random() * greetings.length)];
    } else if (hour < 18) {
      const greetings = DAILY_GREETINGS.afternoon;
      return greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      const greetings = DAILY_GREETINGS.evening;
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  }, []);

  // 获取今日课程
  const todayCourses = useMemo(() => {
    const today = WEEKDAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    return courses.filter(c => c.day === today);
  }, [courses]);

  // 计算任务完成进度
  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const totalTasks = dailyTasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // 获取当前等级
  const currentLevel = useMemo(() => {
    return LEVELS.find(l => points >= l.minPoints && points < l.maxPoints) || LEVELS[0];
  }, [points]);

  // 快速行动按钮
  const quickActions = [
    { id: 'schedule', label: '看课表', icon: Calendar, color: 'bg-blue-500/20 text-blue-400' },
    { id: 'homework', label: '写作业', icon: Pencil, color: 'bg-purple-500/20 text-purple-400' },
    { id: 'focus', label: '专注', icon: Hourglass, color: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'achievements', label: '宝藏', icon: Trophy, color: 'bg-amber-500/20 text-amber-400' },
  ];

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* 问候语卡片 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-br from-magic-accent/20 to-orange-600/10 border border-magic-accent/20 backdrop-blur-xl"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-magic-accent/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-magic-accent" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-serif text-white leading-relaxed">
              {greeting}
            </p>
            <div className="flex items-center gap-4 mt-3">
              {/* 连续打卡 */}
              <div className="flex items-center gap-2">
                <Flame className={cn(
                  "w-4 h-4",
                  streak > 0 ? "text-orange-400" : "text-white/20"
                )} />
                <span className="text-xs text-white/60">
                  {streak > 0 ? `连续{streak}天` : '开始打卡'}
                </span>
              </div>
              {/* 当前等级 */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-white/60">{currentLevel.level}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 今日课程概览 */}
      {todayCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-serif italic text-white/80 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-magic-accent" />
              今日课程
            </h3>
            <button
              onClick={() => onQuickAction('schedule')}
              className="text-xs text-magic-accent hover:text-magic-accent/80 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {todayCourses.slice(0, 3).map((course, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-2xl border flex items-center justify-between",
                  course.color || 'bg-blue-500/20 border-blue-500/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white font-medium">{course.subject}</span>
                </div>
                <span className="text-xs text-white/40 font-mono">{course.time}</span>
              </div>
            ))}
            {todayCourses.length > 3 && (
              <p className="text-xs text-white/40 text-center">
                还有 {todayCourses.length - 3} 节课...
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* 今日任务 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-serif italic text-white/80 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            今日任务
          </h3>
          <span className="text-xs text-white/40">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        {/* 进度条 */}
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          />
        </div>

        <div className="space-y-2">
          {dailyTasks.map(task => (
            <button
              key={task.id}
              onClick={() => !task.completed && onCompleteTask(task.id)}
              disabled={task.completed}
              className={cn(
                "w-full p-3 rounded-2xl border flex items-center gap-3 transition-all text-left",
                task.completed
                  ? "bg-emerald-500/10 border-emerald-500/20 opacity-60"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-magic-accent/30"
              )}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-white/20 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  task.completed ? "text-white/40 line-through" : "text-white"
                )}>
                  {task.text}
                </p>
              </div>
              {!task.completed && (
                <span className="text-xs text-magic-accent font-bold flex-shrink-0">
                  +{task.reward}⭐
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 快速行动 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-4 gap-3"
      >
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => onQuickAction(action.id)}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-magic-accent/30 transition-all"
          >
            <div className={cn("p-2 rounded-xl", action.color)}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs text-white/60">{action.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
});
