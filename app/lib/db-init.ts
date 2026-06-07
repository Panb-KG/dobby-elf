/**
 * 数据库初始化和连接管理
 * 
 * 统一处理：
 * - 数据库目录创建
 * - 表结构初始化
 * - 连接获取
 * 
 * 注意：better-sqlite3 为可选依赖，生产环境（Zeabur）可能不可用
 */

import path from 'path';
import fs from 'fs';

// 动态导入 better-sqlite3（可能不可用）
let Database: any = null;
let sqliteAvailable = false;

try {
  Database = require('better-sqlite3');
  sqliteAvailable = true;
} catch {
  // better-sqlite3 不可用（Zeabur 生产环境），使用 Supabase
  console.log('[DB-INIT] better-sqlite3 不可用，将使用 Supabase 云数据库');
}

const dbPath = path.join(process.cwd(), 'data', 'dobi.db');

/**
 * 确保 data 目录存在
 */
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * 检查 SQLite 是否可用
 */
export function isSqliteAvailable(): boolean {
  return sqliteAvailable;
}

/**
 * 获取数据库连接
 */
export function getDb(): any {
  if (!sqliteAvailable || !Database) {
    throw new Error(
      'SQLite 不可用。请在生产环境使用 Supabase API (/api/supabase)。' +
      '如果需要在本地开发使用 SQLite，请安装 better-sqlite3: npm install better-sqlite3'
    );
  }

  ensureDataDir();
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

/**
 * 初始化数据库表结构
 */
export function initDb() {
  if (!sqliteAvailable) {
    console.log('[DB-INIT] SQLite 不可用，跳过数据库初始化');
    return;
  }

  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT,
      email TEXT,
      created_at TEXT NOT NULL,
      points INTEGER DEFAULT 1250,
      level TEXT DEFAULT '魔法学徒',
      tree_growth INTEGER DEFAULT 0
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      reward INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      day TEXT NOT NULL,
      subject TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS homework (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      due_date TEXT,
      image TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_points (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      subject TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.close();
}
