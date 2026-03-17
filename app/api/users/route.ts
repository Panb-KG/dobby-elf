import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'dobby.db');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const user = db.prepare(`
      SELECT id, username, display_name, email, created_at, points, level, tree_growth
      FROM users WHERE id = ?
    `).get(userId) as any;
    
    db.close();
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      id: user.id, 
      username: user.username, 
      displayName: user.display_name,
      email: user.email,
      createdAt: user.created_at,
      points: user.points,
      level: user.level,
      treeGrowth: user.tree_growth
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, updates } = await req.json();
    
    if (!userId || !updates) {
      return NextResponse.json({ error: '用户ID和更新数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.points !== undefined) {
      fields.push('points = ?');
      values.push(updates.points);
    }
    if (updates.level !== undefined) {
      fields.push('level = ?');
      values.push(updates.level);
    }
    if (updates.treeGrowth !== undefined) {
      fields.push('tree_growth = ?');
      values.push(updates.treeGrowth);
    }
    
    if (fields.length === 0) {
      db.close();
      return NextResponse.json({ error: '没有要更新的字段' }, { status: 400 });
    }
    
    values.push(userId);
    
    db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `).run(...values);
    
    db.close();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}