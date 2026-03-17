import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'dobby.db');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

function initDb() {
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

// Initialize database on first request
let dbInitialized = false;
if (!dbInitialized) {
  const fs = require('fs');
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  initDb();
  dbInitialized = true;
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      db.close();
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }
    
    // Create new user
    const userId = `user_${Date.now()}`;
    const hashedPassword = password; // In production, use proper hashing
    
    db.prepare(`
      INSERT INTO users (id, username, password, display_name, email, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, username, hashedPassword, username, `${username}@dobby.local`, new Date().toISOString());
    
    // Create default daily tasks
    const tasks = [
      { id: `task_${Date.now()}_1`, text: '完成3道奥数题', reward: 50 },
      { id: `task_${Date.now()}_2`, text: '背诵5个新单词', reward: 30 },
      { id: `task_${Date.now()}_3`, text: '查看今日课程表', reward: 10 },
    ];
    
    const insertTask = db.prepare(`
      INSERT INTO daily_tasks (id, user_id, text, completed, reward)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    tasks.forEach(task => {
      insertTask.run(task.id, userId, task.text, 0, task.reward);
    });
    
    db.close();
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: userId, 
        username, 
        displayName: username,
        email: `${username}@dobby.local`,
        createdAt: new Date().toISOString(),
        points: 1250,
        level: '魔法学徒',
        treeGrowth: 0,
        dailyTasks: tasks.map(t => ({ ...t, completed: false }))
      } 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}