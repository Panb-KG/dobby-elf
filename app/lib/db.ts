/**
 * SQLite 数据库封装
 * 
 * 特性：
 * - 单例共享连接（避免每次请求新建连接）
 * - WAL 模式（高并发读写）
 * - 自动迁移
 * - 事务支持
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'dobby.db');

let db: Database.Database | null = null;

/**
 * 获取数据库实例（单例）
 */
export function getDb(): Database.Database {
  if (db) return db;
  
  // 确保 data 目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  db = new Database(DB_PATH);
  
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
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * 执行数据库迁移
 */
function runMigrations(database: Database.Database): void {
  const migrations = [
    // 用户表
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT,
      email TEXT,
      password_hash TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      points INTEGER DEFAULT 0,
      level TEXT DEFAULT '魔法学徒',
      tree_growth REAL DEFAULT 0
    )`,
    
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
    
    // 索引
    `CREATE INDEX IF NOT EXISTS idx_courses_user ON courses(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_homework_user ON homework(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_homework_status ON homework(user_id, status)`,
    `CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, timestamp)`,
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
}

/**
 * 执行事务
 */
export function transaction<T>(fn: (db: Database.Database) => T): T {
  const database = getDb();
  return database.transaction(fn)(database);
}

/**
 * 批量插入辅助
 */
export function batchInsert<T extends Record<string, any>>(
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
