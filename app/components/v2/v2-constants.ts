/**
 * v2.0 页面常量和类型定义
 */

import {
  MessageSquare, Calendar, BookOpen, Star, TreePine,
  PenLine, Pencil, BrainCircuit, Hourglass, Trophy,
} from 'lucide-react';

export const QUICK_ACTIONS = [
  { id: 'chat', label: '聊天', icon: MessageSquare, color: 'from-blue-500 to-blue-600' },
  { id: 'knowledge', label: '知识库', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
  { id: 'diary', label: '魔法日记', icon: PenLine, color: 'from-pink-500 to-pink-600' },
  { id: 'tree', label: '成长之树', icon: TreePine, color: 'from-green-500 to-green-600' },
  { id: 'score', label: '亲子打分', icon: Star, color: 'from-amber-500 to-amber-600' },
  { id: 'schedule', label: '今日课表', icon: Calendar, color: 'from-cyan-500 to-cyan-600' },
  { id: 'homework', label: '作业本', icon: Pencil, color: 'from-rose-500 to-rose-600' },
  { id: 'exercise', label: '练习题', icon: BrainCircuit, color: 'from-violet-500 to-violet-600' },
  { id: 'focus', label: '专注沙漏', icon: Hourglass, color: 'from-teal-500 to-teal-600' },
  { id: 'achievements', label: '我的宝藏', icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
] as const;

export type LeftTab = 'chat' | 'knowledge' | 'diary' | 'tree' | 'score' | 'schedule' | 'homework' | 'exercise' | 'focus' | 'achievements';
export type PanelType = 'none' | 'knowledge_card' | 'exercise' | 'schedule' | 'homework' | 'image' | 'growth_tree' | 'parent_score' | 'profile' | 'diary' | 'focus' | 'achievements';

export const QUICK_PROMPTS = [
  { label: '📚 查课表', text: '今天有什么课？' },
  { label: '📝 查作业', text: '我的作业完成了吗？' },
  { label: '🧮 出数学题', text: '帮我出几道数学题' },
  { label: '🌱 成长之树', text: '看看我的成长之树' },
  { label: '⭐ 今天打分', text: '今天的亲子打分怎么样？' },
  { label: '📝 写日记', text: '我想写一篇魔法日记' },
];
