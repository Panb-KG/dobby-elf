/**
 * 数据库封装 - 兼容 Supabase（云）和 SQLite（本地开发）
 * 
 * 在生产环境（Zeabur）中使用 Supabase，better-sqlite3 作为可选依赖
 * 如果 better-sqlite3 不可用，将使用 Supabase 作为后端
 */

import path from 'path';
import fs from 'fs';

// 动态导入 better-sqlite3（可能不可用）
let Database: typeof import('better-sqlite3') | null = null;
let sqliteAvailable = false;

try {
  Database = require('better-sqlite3');
  sqliteAvailable = true;
} catch {
  // better-sqlite3 不可用（Zeabur 生产环境），使用 Supabase
  console.log('[DB] better-sqlite3 不可用，将使用 Supabase 云数据库');
}

// 类型定义
type DbInstance = any; // eslint-disable-line @typescript-eslint/no-explicit-any

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'dobi.db');

// 使用 globalThis 确保 HMR 和热更新时单例不丢失
interface GlobalWithDb {
  __DOBI_DB_INSTANCE__: DbInstance | undefined;
}

function getGlobalDb(): DbInstance | undefined {
  return (globalThis as unknown as GlobalWithDb).__DOBI_DB_INSTANCE__;
}

function setGlobalDb(db: DbInstance): void {
  (globalThis as unknown as GlobalWithDb).__DOBI_DB_INSTANCE__ = db;
}

/**
 * 检查 SQLite 是否可用
 */
export function isSqliteAvailable(): boolean {
  return sqliteAvailable;
}

/**
 * 获取数据库实例（单例，globalThis 缓存）
 * 如果 better-sqlite3 不可用，抛出错误提示使用 Supabase
 */
export function getDb(): DbInstance {
  if (!sqliteAvailable || !Database) {
    throw new Error(
      'SQLite 不可用。请在生产环境使用 Supabase API (/api/supabase)。' +
      '如果需要在本地开发使用 SQLite，请安装 better-sqlite3: npm install better-sqlite3'
    );
  }

  let db = getGlobalDb();
  if (db) return db;
  
  // 确保 data 目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  db = new Database(DB_PATH) as DbInstance;
  setGlobalDb(db);
  
  // WAL 模式：允许并发读 + 单次写
  db.pragma('journal_mode = WAL');
  
  // 启用外键约束
  db.pragma('foreign_keys = ON');
  
  // 自动迁移
  runMigrations(db);
  
  return db;
}

/**
 * 关闭数据库连接（优雅关闭时使用）
 */
export function closeDb(): void {
  const db = getGlobalDb();
  if (db) {
    db.close();
    setGlobalDb(undefined as unknown as DbInstance);
  }
}

/**
 * 执行数据库迁移
 */
function runMigrations(database: DbInstance): void {
  const migrations = [
    // 用户表（支持家长-孩子模式）
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT,
      email TEXT,
      password TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'child',
      parent_id TEXT,
      child_name TEXT,
      grade TEXT,
      pin_code TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      points INTEGER DEFAULT 1250,
      level TEXT DEFAULT '魔法学徒',
      tree_growth INTEGER DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 家长资料表
    `CREATE TABLE IF NOT EXISTS parent_profiles (
      user_id TEXT PRIMARY KEY,
      phone TEXT,
      real_name TEXT,
      relationship TEXT DEFAULT 'parent',
      notification_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 索引
    `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
    `CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_id)`,
    `CREATE INDEX IF NOT EXISTS idx_users_pin ON users(pin_code)`,
    `CREATE INDEX IF NOT EXISTS idx_parent_profiles_user ON parent_profiles(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_parent_profiles_phone ON parent_profiles(phone)`,
    
    // 课程表
    `CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      day TEXT NOT NULL,
      subject TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT DEFAULT '校内',
      color TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // 作业表
    `CREATE TABLE IF NOT EXISTS homework (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // 成就表
    `CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      icon_name TEXT,
      color TEXT DEFAULT '',
      points INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // 每日任务表
    `CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      reward INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 专注会话表
    `CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      white_noise TEXT DEFAULT 'none',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // 聊天记录表
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // 用户设置表
    `CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      settings TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // 题库表
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      question TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      explanation TEXT,
      type TEXT DEFAULT 'multiple_choice',
      created_at TEXT DEFAULT (datetime('now')),
      source TEXT DEFAULT 'ai'
    )`,
    
    // 练习记录表
    `CREATE TABLE IF NOT EXISTS exercise_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // 练习题目记录表
    `CREATE TABLE IF NOT EXISTS exercise_answers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      user_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      answered_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES exercise_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`,
    
    // 索引
    `CREATE INDEX IF NOT EXISTS idx_courses_user ON courses(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_homework_user ON homework(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_homework_status ON homework(user_id, status)`,
    `CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject, grade, topic)`,
    `CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user ON exercise_sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_exercise_answers_session ON exercise_answers(session_id)`,
    
    // 系统日志表
    `CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL DEFAULT 'info',
      category TEXT NOT NULL DEFAULT 'system',
      message TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    
    // API 使用记录表
    `CREATE TABLE IF NOT EXISTS api_usage (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      user_id TEXT,
      status_code INTEGER,
      duration_ms INTEGER,
      tokens_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    
    // 系统设置表
    `CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    
    // 管理员表
    `CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT,
      role TEXT DEFAULT 'super_admin',
      is_active INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    
    // 审计日志表
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    
    // 定时任务表
    `CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      cron TEXT NOT NULL,
      handler TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      last_run TEXT,
      last_status TEXT,
      next_run TEXT,
      run_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      last_error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    
    // 任务执行记录表
    `CREATE TABLE IF NOT EXISTS task_executions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL DEFAULT 'running',
      result TEXT,
      error TEXT,
      duration_ms INTEGER,
      FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE
    )`,
    
    // 索引
    `CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level)`,
    `CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category)`,
    `CREATE INDEX IF NOT EXISTS idx_system_logs_time ON system_logs(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint)`,
    `CREATE INDEX IF NOT EXISTS idx_api_usage_time ON api_usage(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status)`,
    `CREATE INDEX IF NOT EXISTS idx_task_executions_task ON task_executions(task_id)`,
    `CREATE INDEX IF NOT EXISTS idx_task_executions_time ON task_executions(started_at)`
  ];
  
  const migrationStmt = database.prepare(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at TEXT DEFAULT (datetime('now'))
    )
  `);
  migrationStmt.run();
  
  for (const sql of migrations) {
    database.exec(sql);
  }
  
  // 记录迁移完成
  database.prepare(`
    INSERT OR IGNORE INTO _migrations (name) VALUES ('initial_schema')
  `).run();

  // ===== 家长-孩子模式迁移（兼容已有数据库） =====
  const parentChildMigration = 'parent_child_schema_v2';
  const alreadyMigrated = database.prepare(
    'SELECT id FROM _migrations WHERE name = ?'
  ).get(parentChildMigration);

  if (!alreadyMigrated) {
    const newColumns = [
      "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'child'",
      'ALTER TABLE users ADD COLUMN parent_id TEXT',
      "ALTER TABLE users ADD COLUMN child_name TEXT",
      'ALTER TABLE users ADD COLUMN grade TEXT',
      'ALTER TABLE users ADD COLUMN pin_code TEXT',
      'ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1',
    ];
    for (const col of newColumns) {
      try {
        database.exec(col);
      } catch {
        // 列已存在，忽略
      }
    }

    database.exec("UPDATE users SET role = 'child' WHERE role IS NULL");

    database.prepare(
      `INSERT OR IGNORE INTO _migrations (name) VALUES (?)`
    ).run(parentChildMigration);
  }
}

/**
 * 执行事务
 */
export function transaction<T>(fn: (db: DbInstance) => T): T {
  const database = getDb();
  return database.transaction(fn)(database);
}

/**
 * 批量插入辅助
 */
export function batchInsert<T extends Record<string, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  table: string,
  data: T[]
): { changes: number } {
  if (data.length === 0) return { changes: 0 };
  
  const database = getDb();
  const columns = Object.keys(data[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
  
  const stmt = database.prepare(sql);
  const insertMany = database.transaction((items: T[]) => {
    for (const item of items) {
      stmt.run(columns.map(col => item[col]));
    }
  });
  
  insertMany(data);
  
  return { changes: data.length };
}

export default getDb;
