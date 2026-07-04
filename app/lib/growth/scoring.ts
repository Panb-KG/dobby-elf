/**
 * 亲子打分模块 - Supabase 实现
 *
 * 表: score_rules (打分规则)
 *     score_daily (每日打分记录)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface ScoreRule {
  id: string; userId: string; title: string; description: string;
  maxPoints: number; icon: string; category: string; createdAt: string;
}
export interface DailyScoreRecord {
  id: string; userId: string; ruleId: string; ruleTitle: string; ruleIcon: string;
  score: number; comment: string; scoredBy: string; date: string; createdAt: string;
}

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase 环境变量未配置');
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export { PRESET_RULES } from './constants';

/** 确保 score_rules / score_daily 表存在 */
let tablesChecked = false;
export async function ensureScoreTables(): Promise<void> {
  if (tablesChecked) return;
  const supabase = getSupabase();
  // 尝试查询表是否存在
  const { error: e1 } = await supabase.from('score_rules').select('id').limit(1);
  const { error: e2 } = await supabase.from('score_daily').select('id').limit(1);
  if (e1 || e2) {
    console.error('[Score] 表不存在，请运行 supabase/migrations/002_create_score_tables.sql');
    if (e1) console.error('  score_rules:', e1.message);
    if (e2) console.error('  score_daily:', e2.message);
  }
  tablesChecked = true;
}

// ===== 打分规则 =====

export async function getScoreRules(userId: string): Promise<ScoreRule[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('score_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Score] 获取规则失败:', error);
    return [];
  }

  return ((data || []) as any[]).map(row => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    maxPoints: row.max_points,
    icon: row.icon || '⭐',
    category: row.category || 'other',
    createdAt: row.created_at,
  }));
}

export async function addScoreRule(
  userId: string,
  title: string,
  description: string,
  maxPoints: number,
  icon: string,
  category: string
): Promise<ScoreRule> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('score_rules')
    .insert({
      user_id: userId,
      title,
      description: description || '',
      max_points: maxPoints,
      icon: icon || '⭐',
      category: category || 'other',
    })
    .select()
    .single();

  if (error) {
    console.error('[Score] 添加规则失败:', error);
    throw new Error(error.message || '添加规则失败');
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description || '',
    maxPoints: data.max_points,
    icon: data.icon || '⭐',
    category: data.category || 'other',
    createdAt: data.created_at,
  };
}

export async function deleteScoreRule(ruleId: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('score_rules')
    .delete()
    .eq('id', ruleId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Score] 删除规则失败:', error);
    return false;
  }
  return true;
}

// ===== 每日打分 =====

export async function getTodayScores(userId: string, date?: string): Promise<DailyScoreRecord[]> {
  const supabase = getSupabase();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('score_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('date', targetDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Score] 获取今日打分失败:', error);
    return [];
  }

  return ((data || []) as any[]).map(row => ({
    id: row.id,
    userId: row.user_id,
    ruleId: row.rule_id,
    ruleTitle: row.rule_title || '',
    ruleIcon: row.rule_icon || '⭐',
    score: row.score,
    comment: row.comment || '',
    scoredBy: row.scored_by || 'child',
    date: row.date,
    createdAt: row.created_at,
  }));
}

export async function recordDailyScore(
  userId: string,
  ruleId: string,
  score: number,
  comment: string,
  scoredBy: string,
  date: string
): Promise<DailyScoreRecord> {
  const supabase = getSupabase();

  // 先查规则信息
  const { data: rule } = await supabase
    .from('score_rules')
    .select('title, icon, max_points')
    .eq('id', ruleId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!rule) {
    throw new Error('规则不存在');
  }

  // 限制分数不超过满分
  const clampedScore = Math.min(Math.max(0, score), rule.max_points);

  // upsert: 同一天同一规则只保留最新打分
  const { data, error } = await supabase
    .from('score_daily')
    .upsert({
      user_id: userId,
      rule_id: ruleId,
      rule_title: rule.title,
      rule_icon: rule.icon || '⭐',
      score: clampedScore,
      comment: comment || '',
      scored_by: scoredBy || 'child',
      date: date,
    }, {
      onConflict: 'user_id,rule_id,date',
    })
    .select()
    .single();

  if (error) {
    console.error('[Score] 记录打分失败:', error);
    throw new Error(error.message || '记录打分失败');
  }

  return {
    id: data.id,
    userId: data.user_id,
    ruleId: data.rule_id,
    ruleTitle: data.rule_title || '',
    ruleIcon: data.rule_icon || '⭐',
    score: data.score,
    comment: data.comment || '',
    scoredBy: data.scored_by || 'child',
    date: data.date,
    createdAt: data.created_at,
  };
}

export async function getDailyTotal(userId: string, date?: string): Promise<{ total: number; max: number; percentage: number }> {
  const supabase = getSupabase();
  const targetDate = date || new Date().toISOString().split('T')[0];

  // 获取当日所有打分
  const { data: records } = await supabase
    .from('score_daily')
    .select('score')
    .eq('user_id', userId)
    .eq('date', targetDate);

  const total = (records || []).reduce((sum, r) => sum + (r.score || 0), 0);

  // 获取用户所有规则的满分总和
  const { data: rules } = await supabase
    .from('score_rules')
    .select('max_points')
    .eq('user_id', userId);

  const max = (rules || []).reduce((sum, r) => sum + (r.max_points || 0), 0);
  const percentage = max > 0 ? Math.round((total / max) * 100) : 0;

  return { total, max, percentage };
}
