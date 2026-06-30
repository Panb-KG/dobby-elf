/**
 * 成就侧边栏组件
 */

"use client";

import { motion } from 'motion/react';
import { TrendingUp, Leaf, Droplets, Award, Trophy, Star, Medal, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DailyTask, Achievement } from '../../types';

export interface AchievementsSidebarProps {
  points: number;
  level: string;
  treeGrowth: number;
  dailyTasks: DailyTask[];
  achievements: Achievement[];
  onCompleteTask: (id: string) => void;
  onWaterTree: () => void;
}

export function AchievementsSidebarContent({
  points, level, treeGrowth, dailyTasks, achievements, onCompleteTask, onWaterTree,
}: AchievementsSidebarProps) {
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = { Award, Trophy, Star, Medal };
    return icons[iconName] || Award;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 rounded-3xl bg-gradient-to-br from-magic-accent to-orange-600 shadow-lg shadow-magic-accent/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">当前等级</span>
            <span className="text-white font-serif font-bold text-lg">{level}</span>
          </div>
          <TrendingUp className="w-4 h-4 text-white/60" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-serif font-bold text-white">{points}</span>
          <span className="text-sm text-white/60 font-medium">pts</span>
        </div>
        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (points % 1000) / 10)}%` }} />
        </div>
        <p className="text-[10px] mt-2 text-white/60">距离下一等级还差 {1000 - (points % 1000)} 积分</p>
      </div>
      <div className="p-5 rounded-3xl bg-emerald-900/40 border border-emerald-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-serif italic text-emerald-100">知识之树</h3></div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">等级 {Math.floor(treeGrowth / 5) + 1}</span>
        </div>
        <div className="relative h-32 flex items-end justify-center mb-4">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <motion.path d="M50 90 L50 60" stroke="#5d4037" strokeWidth="4" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            {treeGrowth > 0 && <motion.circle cx="50" cy="50" r={Math.min(30, 10 + treeGrowth * 2)} fill="#2e7d32" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
            {treeGrowth > 10 && <motion.circle cx="35" cy="40" r="15" fill="#43a047" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
            {treeGrowth > 20 && <motion.circle cx="65" cy="40" r="15" fill="#43a047" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
          </svg>
        </div>
        <button onClick={onWaterTree} disabled={points < 50} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
          <Droplets className="w-4 h-4" /> 灌溉知识之树 (50 pts)
        </button>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">每日魔法任务</h3>
        <div className="space-y-2">
          {dailyTasks.map(task => (
            <button key={task.id} onClick={() => onCompleteTask(task.id)} disabled={task.completed} className={cn(
              "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left",
              task.completed ? "bg-white/5 border-white/5 opacity-60" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-magic-accent/30"
            )}>
              {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-white/20" />}
              <div className="flex-1">
                <p className={cn("text-sm font-medium", task.completed ? "text-white/40 line-through" : "text-white")}>{task.text}</p>
                <span className="text-[10px] text-magic-accent font-bold">+{task.reward} pts</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">荣誉记录</h3>
        <div className="grid grid-cols-1 gap-3">
          {achievements.map((ach) => {
            const IconComponent = getIconComponent(ach.iconName);
            return (
              <div key={ach.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                <div className={cn("p-3 rounded-xl bg-white/5", ach.color)}><IconComponent className="w-5 h-5" /></div>
                <div className="flex-1"><h4 className="text-sm font-medium text-white">{ach.title}</h4><p className="text-[10px] text-white/40 uppercase tracking-wider">{ach.date}</p></div>
                <Medal className="w-4 h-4 text-white/10 group-hover:text-magic-accent transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
