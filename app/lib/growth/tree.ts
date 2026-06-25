/**
 * 成长之树模块
 * 
 * 管理孩子的成长积分和成长之树
 * v2.0 新增
 */

import { getDb } from '../db';

export interface GrowthTreeNode {
  id: string;
  userId: string;
  totalPoints: number;
  treeLevel: number;
  treeStage: string;
  waterCount: number;
  lastWateredAt?: string;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GrowthPointRecord {
  id: string;
  userId: string;
  points: number;
  reason: string;
  source: string;
  createdAt: string;
}

/**
 * 成长之树阶段定义
 */
const TREE_STAGES = [
  { minLevel: 1, maxLevel: 10, name: '种子', emoji: '🌱' },
  { minLevel: 11, maxLevel: 25, name: '嫩芽', emoji: '🌿' },
  { minLevel: 26, maxLevel: 40, name: '小树', emoji: '🌳' },
  { minLevel: 41, maxLevel: 60, name: '大树', emoji: '🌲' },
  { minLevel: 61, maxLevel: 80, name: '参天树', emoji: '🏔️' },
  { minLevel: 81, maxLevel: 100, name: '魔法之树', emoji: '✨' },
];

/**
 * 获取用户的成长之树
 */
export function getGrowthTree(userId: string): GrowthTreeNode | null {
  const db = getDb();

  const row = db.prepare(`
    SELECT * FROM growth_trees WHERE user_id = ?
  `).get(userId) as any;

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    totalPoints: row.total_points,
    treeLevel: row.tree_level,
    treeStage: row.tree_stage,
    waterCount: row.water_count,
    lastWateredAt: row.last_watered_at,
    achievements: row.achievements ? JSON.parse(row.achievements) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 创建成长之树（新用户初始化）
 */
export function createGrowthTree(userId: string): GrowthTreeNode {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO growth_trees
    (id, user_id, total_points, tree_level, tree_stage, water_count, achievements, created_at, updated_at)
    VALUES (?, 0, 1, '种子', 0, '[]', ?, ?)
  `).run(id, userId, now, now);

  return {
    id,
    userId,
    totalPoints: 0,
    treeLevel: 1,
    treeStage: '种子',
    waterCount: 0,
    achievements: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 添加成长积分
 */
export function addGrowthPoints(
  userId: string,
  points: number,
  reason: string,
  source: string
): { tree: GrowthTreeNode; record: GrowthPointRecord } {
  const db = getDb();

  // 获取或创建成长之树
  let tree = getGrowthTree(userId);
  if (!tree) {
    tree = createGrowthTree(userId);
  }

  const now = new Date().toISOString();
  const recordId = generateId();
  const newTotal = tree.totalPoints + points;

  // 计算新等级
  const newLevel = pointsToLevel(newTotal);
  const newStage = levelToStage(newLevel);

  // 插入积分记录
  db.prepare(`
    INSERT INTO growth_point_records (id, user_id, points, reason, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(recordId, userId, points, reason, source, now);

  // 更新成长之树
  db.prepare(`
    UPDATE growth_trees
    SET total_points = ?, tree_level = ?, tree_stage = ?, updated_at = ?
    WHERE user_id = ?
  `).run(newTotal, newLevel, newStage, now, userId);

  const updatedTree = getGrowthTree(userId)!;
  const record: GrowthPointRecord = {
    id: recordId,
    userId,
    points,
    reason,
    source,
    createdAt: now,
  };

  return { tree: updatedTree, record };
}

/**
 * 浇水（每日浇水，每次+10积分）
 */
export function waterTree(userId: string): { tree: GrowthTreeNode; watered: boolean } {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  let tree = getGrowthTree(userId);
  if (!tree) {
    tree = createGrowthTree(userId);
  }

  // 检查今日是否已浇水
  if (tree.lastWateredAt && tree.lastWateredAt.startsWith(today)) {
    return { tree, watered: false };
  }

  // 浇水：+10 积分
  const result = addGrowthPoints(userId, 10, '每日浇水 🌊', 'water');

  // 更新浇水记录
  db.prepare(`
    UPDATE growth_trees SET water_count = water_count + 1, last_watered_at = ? WHERE user_id = ?
  `).run(new Date().toISOString(), userId);

  return { tree: result.tree, watered: true };
}

/**
 * 获取积分记录
 */
export function getPointRecords(userId: string, limit = 20): GrowthPointRecord[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT * FROM growth_point_records
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    points: row.points,
    reason: row.reason,
    source: row.source,
    createdAt: row.created_at,
  }));
}

// ===== 辅助函数 =====

/**
 * 积分 → 等级
 * 每 100 积分 = 1 级，最高 100 级
 */
function pointsToLevel(points: number): number {
  return Math.min(Math.floor(points / 100) + 1, 100);
}

/**
 * 等级 → 阶段名称
 */
function levelToStage(level: number): string {
  for (const stage of TREE_STAGES) {
    if (level >= stage.minLevel && level <= stage.maxLevel) {
      return `${stage.emoji} ${stage.name}`;
    }
  }
  return '🌱 种子';
}

function generateId(): string {
  return 'gtp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
