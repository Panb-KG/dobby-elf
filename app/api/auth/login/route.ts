import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const dbPath = path.join(process.cwd(), 'data', 'dobby.db');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Get user by username
    const user = db.prepare(`
      SELECT id, username, password, display_name, email, created_at, points, level, tree_growth
      FROM users WHERE username = ?
    `).get(username) as any;
    
    db.close();
    
    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }
    
    // Get user's daily tasks
    const taskDb = getDb();
    const tasks = taskDb.prepare(`
      SELECT id, text, completed, reward FROM daily_tasks WHERE user_id = ?
    `).all(user.id);
    
    taskDb.close();
    
    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: '7d' } // 7天过期
    );
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        displayName: user.display_name,
        email: user.email,
        createdAt: user.created_at,
        points: user.points,
        level: user.level,
        treeGrowth: user.tree_growth,
        dailyTasks: tasks
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}