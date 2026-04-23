/**
 * 数据库迁移脚本
 * 
 * 用法：
 *   npx tsx scripts/migrate.ts          # 执行所有待执行的迁移
 *   npx tsx scripts/migrate.ts --status  # 查看迁移状态
 *   npx tsx scripts/migrate.ts --reset   # 重置数据库（删除并重建）
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'dobby.db');

function getDb(): Database.Database {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

const MIGRATIONS = [
  {
    name: '001_initial_schema',
    up: (db: Database.Database) => {
      console.log('  → 创建用户表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
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
        )
      `);
      
      console.log('  → 创建课程表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          day TEXT NOT NULL,
          subject TEXT NOT NULL,
          time TEXT NOT NULL,
          type TEXT DEFAULT '校内',
          color TEXT DEFAULT '',
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('  → 创建作业表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS homework (
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
        )
      `);
      
      console.log('  → 创建成就表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS achievements (
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
        )
      `);
      
      console.log('  → 创建专注会话表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS focus_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          duration INTEGER NOT NULL,
          completed INTEGER DEFAULT 0,
          white_noise TEXT DEFAULT 'none',
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('  → 创建聊天记录表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          image_url TEXT,
          timestamp TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('  → 创建用户设置表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_settings (
          user_id TEXT PRIMARY KEY,
          settings TEXT DEFAULT '{}',
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('  → 创建索引...');
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_courses_user ON courses(user_id);
        CREATE INDEX IF NOT EXISTS idx_homework_user ON homework(user_id);
        CREATE INDEX IF NOT EXISTS idx_homework_status ON homework(user_id, status);
        CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
        CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, timestamp);
      `);
    },
  },
];

function getStatus() {
  const db = getDb();
  
  // 确保 migrations 表存在
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  const executed = db.prepare('SELECT name FROM _migrations ORDER BY id').all() as any[];
  const executedNames = new Set(executed.map(m => m.name));
  
  console.log('\n📊 迁移状态:\n');
  
  for (const migration of MIGRATIONS) {
    const status = executedNames.has(migration.name) ? '✅ 已执行' : '⏳ 待执行';
    console.log(`  ${status}  ${migration.name}`);
  }
  
  console.log('');
  db.close();
}

function runMigrations() {
  const db = getDb();
  
  // 确保 migrations 表存在
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  const executed = db.prepare('SELECT name FROM _migrations ORDER BY id').all() as any[];
  const executedNames = new Set(executed.map(m => m.name));
  
  const pending = MIGRATIONS.filter(m => !executedNames.has(m.name));
  
  if (pending.length === 0) {
    console.log('✅ 数据库已是最新状态');
    db.close();
    return;
  }
  
  console.log(`\n🔨 执行 ${pending.length} 个迁移...\n`);
  
  for (const migration of pending) {
    console.log(`  ▶ ${migration.name}`);
    const start = Date.now();
    
    try {
      db.transaction(() => {
        migration.up(db);
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name);
      })();
      
      const elapsed = Date.now() - start;
      console.log(`  ✅ ${migration.name} (${elapsed}ms)\n`);
    } catch (error) {
      console.error(`  ❌ ${migration.name} 失败:`, error);
      db.close();
      process.exit(1);
    }
  }
  
  console.log('🎉 所有迁移执行完成！\n');
  db.close();
}

function resetDb() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('🗑️  数据库已删除');
  }
  
  // 删除 WAL 和 SHM 文件
  const walPath = DB_PATH + '-wal';
  const shmPath = DB_PATH + '-shm';
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  
  console.log('🔨 重新初始化数据库...\n');
  runMigrations();
}

// 主逻辑
const args = process.argv.slice(2);

if (args.includes('--status')) {
  getStatus();
} else if (args.includes('--reset')) {
  resetDb();
} else {
  runMigrations();
}
