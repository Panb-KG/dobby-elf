/**
 * 亲子打分模块
 * 
 * 孩子和父母约定打分规则，每天打分计入成长积分
 * v2.0 新增
 */

import { getDb } from '../db';

export interface ScoreRule {
  id: string;
  userId: string;
  title: string;
  description: string;
  maxPoints: number;
  icon: string;
  category: string;
  createdAt: string;
}

export interface DailyScoreRecord {
  id: string;
  userId: string;
  ruleId: string;
  ruleTitle: string;
  ruleIcon: string;
  score: number;
  comment?: string;
  scoredBy: string;
  date: string;
  createdAt: string;
}

/**
 * 获取打分规则列表
 */
export function getScoreRules(userId: string): ScoreRule[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT * FROM score_rules WHERE user_id = ? ORDER BY category, title
  `).all(userId) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    maxPoints: row.max_points,
    icon: row.icon,
    category: row.category,
    createdAt: row.created_at,
  }));
}

/**
 * 添加打分规则
 */
export function addScoreRule(
  userId: string,
  title: string,
  description: string,
  maxPoints: number,
  icon: string,
  category: string
): ScoreRule {
  const db = getDb();
  const id = 'scr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO score_rules (id, user_id, title, description, max_points, icon, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, description, maxPoints, icon, category, now);

  return { id, userId, title, description, maxPoints, icon, category, createdAt: now };
}

/**
 * 删除打分规则
 */
export function deleteScoreRule(ruleId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM score_rules WHERE id = ? AND user_id = ?
  `).run(ruleId, userId);

  return result.changes > 0;
}

/**
 * 记录每日打分
 */
export function recordDailyScore(
  userId: string,
  ruleId: string,
  score: number,
  comment: string,
  scoredBy: string,
  date: string
): DailyScoreRecord {
  const db = getDb();

  // 获取规则信息
  const rule = db.prepare(`
    SELECT * FROM score_rules WHERE id = ? AND user_id = ?
  `).get(ruleId, userId) as any;

  if (!rule) {
    throw new Error('打分规则不存在');
  }

  // 限制分数范围
  const finalScore = Math.max(0, Math.min(score, rule.max_points));
  const id = 'dsr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();

  // 插入打分记录
  db.prepare(`
    INSERT INTO daily_score_records
    (id, user_id, rule_id, score, comment, scored_by, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, ruleId, finalScore, comment || null, scoredBy, date, now);

  return {
    id,
    userId,
    ruleId,
    ruleTitle: rule.title,
    ruleIcon: rule.icon,
    score: finalScore,
    comment: comment || undefined,
    scoredBy,
    date,
    createdAt: now,
  };
}

/**
 * 获取今日打分记录
 */
export function getTodayScores(userId: string, date?: string): DailyScoreRecord[] {
  const db = getDb();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT d.*, r.title as rule_title, r.icon as rule_icon
    FROM daily_score_records d
    JOIN score_rules r ON d.rule_id = r.id
    WHERE d.user_id = ? AND d.date = ?
    ORDER BY r.category, r.title
  `).all(userId, targetDate) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    ruleId: row.rule_id,
    ruleTitle: row.rule_title,
    ruleIcon: row.rule_icon,
    score: row.score,
    comment: row.comment || undefined,
    scoredBy: row.scored_by,
    date: row.date,
    createdAt: row.created_at,
  }));
}

/**
 * 获取每日总分
 */
export function getDailyTotal(userId: string, date?: string): { total: number; max: number; percentage: number } {
  const db = getDb();
  const targetDate = date || new Date().toISOString().split('T')[0];

  // 今日已得分
  const scoredRow = db.prepare(`
    SELECT COALESCE(SUM(d.score), 0) as total
    FROM daily_score_records d
    WHERE d.user_id = ? AND d.date = ?
  `).get(userId, targetDate) as any;

  // 今日满分
  const maxRow = db.prepare(`
    SELECT COALESCE(SUM(r.max_points), 0) as max
    FROM score_rules r
    WHERE r.user_id = ?
  `).get(userId) as any;

  const total = scoredRow.total;
  const max = maxRow.max;
  const percentage = max > 0 ? Math.round((total / max) * 100) : 0;

  return { total, max, percentage };
}

/**
 * 预设规则模板（方便快速创建）
 */
export const PRESET_RULES = [
  { title: '按时完成作业', description: '每天放学后按时完成作业', maxPoints: 5, icon: '📚', category: 'study' },
  { title: '主动学习', description: '不需要催，自己主动学习', maxPoints: 5, icon: '💪', category: 'study' },
  { title: '阅读习惯', description: '每天阅读课外书至少 20 分钟', maxPoints: 3, icon: '📖', category: 'study' },
  { title: '运动锻炼', description: '每天运动至少 30 分钟', maxPoints: 3, icon: '🏃', category: 'exercise' },
  { title: '早睡早起', description: '晚上 9:30 前睡觉，早上按时起床', maxPoints: 3, icon: '😴', category: 'life' },
  { title: '整理房间', description: '自己的房间自己整理', maxPoints: 2, icon: '🧹', category: 'life' },
  { title: '礼貌待人', description: '对人有礼貌，不说粗话', maxPoints: 3, icon: '😊', category: 'behavior' },
  { title: '帮助做家务', description: '主动帮忙做家务（洗碗、扫地等）', maxPoints: 3, icon: '🤝', category: 'behavior' },
  { title: '少看电子屏幕', description: '非学习用途的屏幕时间不超过 1 小时', maxPoints: 3, icon: '📵', category: 'life' },
  { title: '诚实守信', description: '不说谎，做错事勇于承认', maxPoints: 5, icon: '⭐', category: 'behavior' },
];
