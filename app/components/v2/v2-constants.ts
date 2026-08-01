/**
 * v2.0 页面常量和类型定义
 */

import {
  Calendar, BookOpen, Star, TreePine,
  PenLine, Pencil, BrainCircuit, Hourglass, Trophy,
} from 'lucide-react';

export const QUICK_ACTIONS = [
  { id: 'schedule', label: '今日课表', icon: Calendar, color: 'from-cyan-500 to-cyan-600' },
  { id: 'homework', label: '作业本', icon: Pencil, color: 'from-rose-500 to-rose-600' },
  { id: 'exercise', label: '练习题', icon: BrainCircuit, color: 'from-violet-500 to-violet-600' },
  { id: 'diary', label: '魔法日记', icon: PenLine, color: 'from-pink-500 to-pink-600' },
  { id: 'score', label: '亲子打分', icon: Star, color: 'from-amber-500 to-amber-600' },
  { id: 'tree', label: '成长之树', icon: TreePine, color: 'from-green-500 to-green-600' },
  { id: 'focus', label: '专注沙漏', icon: Hourglass, color: 'from-teal-500 to-teal-600' },
  { id: 'achievements', label: '我的宝藏', icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
  { id: 'knowledge', label: '知识库', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
] as const;

// ===== 动态菜单：按使用频次排序 =====
const MENU_FREQ_KEY = 'dobi_menu_freq';

type QuickAction = (typeof QUICK_ACTIONS)[number];

/** 记录菜单点击 */
export function trackMenuClick(actionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const freq: Record<string, number> = JSON.parse(localStorage.getItem(MENU_FREQ_KEY) || '{}');
    freq[actionId] = (freq[actionId] || 0) + 1;
    localStorage.setItem(MENU_FREQ_KEY, JSON.stringify(freq));
  } catch { /* ignore */ }
}

/** 按使用频次降序排列菜单（频次相同保持默认顺序） */
export function getSortedActions(): QuickAction[] {
  if (typeof window === 'undefined') return [...QUICK_ACTIONS];
  try {
    const freq: Record<string, number> = JSON.parse(localStorage.getItem(MENU_FREQ_KEY) || '{}');
    return [...QUICK_ACTIONS].sort((a, b) => {
      const fa = freq[a.id] || 0;
      const fb = freq[b.id] || 0;
      if (fb !== fa) return fb - fa; // 频次高的排前面
      // 频次相同，保持默认顺序
      return QUICK_ACTIONS.findIndex(x => x.id === a.id) - QUICK_ACTIONS.findIndex(x => x.id === b.id);
    });
  } catch {
    return [...QUICK_ACTIONS];
  }
}

export type LeftTab = 'knowledge' | 'diary' | 'tree' | 'score' | 'schedule' | 'homework' | 'exercise' | 'focus' | 'achievements';
export type PanelType = 'none' | 'knowledge_card' | 'exercise' | 'schedule' | 'homework' | 'image' | 'growth_tree' | 'parent_score' | 'profile' | 'diary' | 'focus' | 'achievements';

export const QUICK_PROMPTS = [
  { label: '📚 查课表', text: '今天有什么课？' },
  { label: '📝 查作业', text: '我的作业完成了吗？' },
  { label: '🧮 出数学题', text: '帮我出几道数学题' },
  { label: '🌱 成长之树', text: '看看我的成长之树' },
  { label: '⭐ 今天打分', text: '今天的亲子打分怎么样？' },
  { label: '📝 写日记', text: '我想写一篇魔法日记' },
];
