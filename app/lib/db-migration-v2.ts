/**
 * v2.0 数据库迁移
 * 
 * 新增表：
 * - knowledge_items: 知识库条目
 * - growth_trees: 成长之树
 * - growth_point_records: 成长积分记录
 * - score_rules: 亲子打分规则
 * - daily_score_records: 每日打分记录
 * - showcase_profiles: 个人展示（预留）
 */

import { getDb } from '../db';

const MIGRATION_NAME = 'v2_dobi_agent_schema';

export function runV2Migration(): void {
  const db = getDb();

  // 检查是否已执行
  const existing = db.prepare(
    "SELECT id FROM _migrations WHERE name = ?"
  ).get(MIGRATION_NAME);

  if (existing) return;

  console.log('[DB Migration] 执行 v2.0 Agent 架构迁移...');

  const migrations = [
    // ===== 知识库表 =====
    `CREATE TABLE IF NOT EXISTS knowledge_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_knowledge_user ON knowledge_items(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_items(category)`,

    // ===== 成长之树表 =====
    `CREATE TABLE IF NOT EXISTS growth_trees (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      total_points INTEGER DEFAULT 0,
      tree_level INTEGER DEFAULT 1,
      tree_stage TEXT DEFAULT '种子',
      water_count INTEGER DEFAULT 0,
      last_watered_at TEXT,
      achievements TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_growth_tree_user ON growth_trees(user_id)`,

    // ===== 成长积分记录表 =====
    `CREATE TABLE IF NOT EXISTS growth_point_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_growth_records_user ON growth_point_records(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_growth_records_time ON growth_point_records(created_at)`,

    // ===== 亲子打分规则表 =====
    `CREATE TABLE IF NOT EXISTS score_rules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      max_points INTEGER NOT NULL,
      icon TEXT DEFAULT '⭐',
      category TEXT NOT NULL DEFAULT 'other',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_score_rules_user ON score_rules(user_id)`,

    // ===== 每日打分记录表 =====
    `CREATE TABLE IF NOT EXISTS daily_score_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      rule_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      comment TEXT,
      scored_by TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (rule_id) REFERENCES score_rules(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_daily_scores_user ON daily_score_records(user_id, date)`,

    // ===== 个人展示（预留） =====
    `CREATE TABLE IF NOT EXISTS showcase_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      title TEXT DEFAULT '我的成长档案',
      resume_data TEXT DEFAULT '{}',
      achievements TEXT DEFAULT '[]',
      certificates TEXT DEFAULT '[]',
      photos TEXT DEFAULT '[]',
      is_public INTEGER DEFAULT 0,
      slug TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_showcase_user ON showcase_profiles(user_id)`,

    // ===== 魔法日记 =====
    `CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '无标题',
      content TEXT NOT NULL DEFAULT '',
      mood TEXT,
      weather TEXT,
      is_voice INTEGER DEFAULT 0,
      voice_duration INTEGER,
      images TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_diary_user ON diary_entries(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(date)`,
  ];

  for (const sql of migrations) {
    db.exec(sql);
  }

  // 记录迁移
  db.prepare(
    "INSERT OR IGNORE INTO _migrations (name) VALUES (?)"
  ).run(MIGRATION_NAME);

  console.log('[DB Migration] v2.0 Agent 架构迁移完成 ✅');
}

/**
 * 自动执行迁移（在应用启动时调用）
 */
export function ensureV2Schema(): void {
  try {
    runV2Migration();
  } catch (error) {
    console.error('[DB Migration] v2.0 迁移失败:', error);
    // 不阻塞启动，但记录错误
  }
}
