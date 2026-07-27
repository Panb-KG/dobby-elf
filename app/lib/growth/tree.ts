/**
 * 成长之树模块 - Supabase 实现
 *
 * 表: growth_trees (成长之树状态)
 *     growth_point_records (积分变动记录)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface GrowthTreeNode {
  id: string; userId: string; totalPoints: number; treeLevel: number;
  treeStage: string; waterCount: number; lastWateredAt?: string;
  achievements: string[]; createdAt: string; updatedAt: string;
}
export interface GrowthPointRecord {
  id: string; userId: string; points: number; reason: string; source: string; createdAt: string;
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

/** 确保 growth 表存在 */
let tablesChecked = false;
export async function ensureGrowthTables(): Promise<void> {
  if (tablesChecked) return;
  const supabase = getSupabase();
  const { error: e1 } = await supabase.from('growth_trees').select('id').limit(1);
  const { error: e2 } = await supabase.from('growth_point_records').select('id').limit(1);
  if (e1 || e2) {
    console.error('[Growth] 表不存在，请运行 supabase/migrations/003_create_growth_tables.sql');
    if (e1) console.error('  growth_trees:', e1.message);
    if (e2) console.error('  growth_point_records:', e2.message);
  }
  tablesChecked = true;
}

/** 根据积分计算等级和阶段 */
function calcLevelAndStage(totalPoints: number): { level: number; stage: string } {
  if (totalPoints < 50) return { level: 1, stage: 'seed' };
  if (totalPoints < 150) return { level: 2, stage: 'sprout' };
  if (totalPoints < 350) return { level: 3, stage: 'sapling' };
  if (totalPoints < 700) return { level: 4, stage: 'tree' };
  if (totalPoints < 1500) return { level: 5, stage: 'giant' };
  return { level: 6, stage: 'magic' };
}

function rowToNode(row: any): GrowthTreeNode {
  return {
    id: row.id,
    userId: row.user_id,
    totalPoints: row.total_points || 0,
    treeLevel: row.tree_level || 1,
    treeStage: row.tree_stage || 'seed',
    waterCount: row.water_count || 0,
    lastWateredAt: row.last_watered_at,
    achievements: row.achievements || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 获取成长之树 */
export async function getGrowthTree(userId: string): Promise<GrowthTreeNode | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('growth_trees')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Growth] 获取成长之树失败:', error);
    return null;
  }
  return data ? rowToNode(data) : null;
}

/** 创建成长之树 */
export async function createGrowthTree(userId: string): Promise<GrowthTreeNode> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('growth_trees')
    .insert({
      user_id: userId,
      total_points: 0,
      tree_level: 1,
      tree_stage: 'seed',
      water_count: 0,
      achievements: [],
    })
    .select()
    .single();

  if (error) {
    console.error('[Growth] 创建成长之树失败:', error);
    throw new Error(error.message || '创建成长之树失败');
  }
  return rowToNode(data);
}

/** 增加成长积分（打分、任务等来源） */
export async function addGrowthPoints(
  userId: string, points: number, reason: string, source: string
): Promise<{ tree: GrowthTreeNode; record: GrowthPointRecord }> {
  const supabase = getSupabase();

  // 确保树存在
  let tree = await getGrowthTree(userId);
  if (!tree) {
    tree = await createGrowthTree(userId);
  }

  const newTotal = tree.totalPoints + points;
  const { level, stage } = calcLevelAndStage(newTotal);

  // 更新树状态
  const { data: updatedTree, error: treeErr } = await supabase
    .from('growth_trees')
    .update({
      total_points: newTotal,
      tree_level: level,
      tree_stage: stage,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (treeErr) {
    console.error('[Growth] 更新积分失败:', treeErr);
    throw new Error(treeErr.message || '更新积分失败');
  }

  // 写入积分记录
  const { data: record, error: recErr } = await supabase
    .from('growth_point_records')
    .insert({
      user_id: userId,
      points,
      reason,
      source,
    })
    .select()
    .single();

  if (recErr) {
    console.error('[Growth] 写入积分记录失败:', recErr);
    throw new Error(recErr.message || '写入积分记录失败');
  }

  return {
    tree: rowToNode(updatedTree),
    record: {
      id: record.id,
      userId: record.user_id,
      points: record.points,
      reason: record.reason,
      source: record.source,
      createdAt: record.created_at,
    },
  };
}

/** 浇水（每日一次，+10 积分） */
export async function waterTree(userId: string): Promise<{ tree: GrowthTreeNode; watered: boolean }> {
  const supabase = getSupabase();

  let tree = await getGrowthTree(userId);
  if (!tree) {
    tree = await createGrowthTree(userId);
  }

  // 检查今日是否已浇水
  const today = new Date().toISOString().split('T')[0];
  if (tree.lastWateredAt) {
    const lastDate = new Date(tree.lastWateredAt).toISOString().split('T')[0];
    if (lastDate === today) {
      return { tree, watered: false };
    }
  }

  const newPoints = tree.totalPoints + 10;
  const newWaterCount = tree.waterCount + 1;
  const { level, stage } = calcLevelAndStage(newPoints);

  const { data: updatedTree, error } = await supabase
    .from('growth_trees')
    .update({
      total_points: newPoints,
      tree_level: level,
      tree_stage: stage,
      water_count: newWaterCount,
      last_watered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Growth] 浇水失败:', error);
    throw new Error(error.message || '浇水失败');
  }

  // 写入积分记录
  await supabase.from('growth_point_records').insert({
    user_id: userId,
    points: 10,
    reason: '每日浇水',
    source: 'water',
  });

  return { tree: rowToNode(updatedTree), watered: true };
}

/** 获取积分记录 */
export async function getPointRecords(userId: string, limit = 20): Promise<GrowthPointRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('growth_point_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Growth] 获取积分记录失败:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    points: row.points,
    reason: row.reason || '',
    source: row.source || '',
    createdAt: row.created_at,
  }));
}
