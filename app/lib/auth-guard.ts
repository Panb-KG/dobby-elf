/**
 * 认证拦截工具
 * 
 * 用于识别哪些功能需要用户登录，哪些可以访客使用
 */

import type { PanelType } from '@/components/v2/v2-constants';

/**
 * 需要登录才能使用的功能列表
 * 
 * 判断标准：是否需要向 Supabase 写入数据
 * 
 * 这些功能涉及个性化数据写入：
 * - 成长之树 → growth_records 表（浇水记录、成长进度）
 * - 魔法日记 → diary_entries 表（日记条目）
 * - 亲子打分 → score_daily 表（评分记录）
 * - 作业本 → homework 表（个人作业清单）
 * - 专注沙漏 → focus_sessions 表（专注时长记录）
 * - 我的宝藏 → achievements 表（成就解锁记录）
 */
const REQUIRES_AUTH_PANELS: Set<PanelType> = new Set([
  'growth_tree',
  'diary',
  'parent_score',
  'homework',
  'focus',
  'achievements',
]);

/**
 * 检查某个功能是否需要登录
 * @param panelType 面板类型
 * @returns 是否需要登录
 */
export function requiresAuth(panelType: PanelType): boolean {
  return REQUIRES_AUTH_PANELS.has(panelType);
}

/**
 * 检查快捷操作是否需要登录
 * @param actionId 操作ID
 * @returns 是否需要登录
 */
export function actionRequiresAuth(actionId: string): boolean {
  const authRequiredActions = [
    'tree',        // 成长之树
    'diary',       // 魔法日记
    'score',       // 亲子打分
    'homework',    // 作业本
    'focus',       // 专注沙漏
    'achievements', // 我的宝藏
  ];
  return authRequiredActions.includes(actionId);
}

/**
 * 快速提示语（根据功能类型）
 */
export function getAuthPrompt(feature: string): string {
  const prompts: Record<string, string> = {
    growth_tree: '🌱 查看成长之树需要登录哦！登录后可以看到你的学习进度和成长记录。',
    diary: '📝 写魔法日记需要登录哦！登录后可以保存你的精彩想法。',
    parent_score: '⭐ 亲子打分需要登录哦！登录后可以记录你和家人的互动评分。',
    homework: '📚 查看作业需要登录哦！登录后可以管理你的个人作业清单。',
    focus: '⏳ 专注沙漏需要登录哦！登录后可以记录你的专注时间。',
    achievements: '🏆 查看宝藏需要登录哦！登录后可以看到你获得的所有成就。',
    default: '✨ 这个功能需要登录才能使用哦！点击左下角的"登录/注册"按钮即可。',
  };
  return prompts[feature] || prompts.default;
}
