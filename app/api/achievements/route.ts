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
    const achievements = db.prepare(`
      SELECT id, title, date, type, icon_name, color FROM achievements WHERE user_id = ?
    `).all(userId);
    
    db.close();
    
    return NextResponse.json(achievements);
  } catch (error: any) {
    console.error('Get achievements error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, achievement } = await req.json();
    
    if (!userId || !achievement) {
      return NextResponse.json({ error: '用户ID和成就数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const achievementId = achievement.id || `achievement_${Date.now()}`;
    
    db.prepare(`
      INSERT INTO achievements (id, user_id, title, date, type, icon_name, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(achievementId, userId, achievement.title, achievement.date, achievement.type, achievement.iconName, achievement.color);
    
    db.close();
    
    return NextResponse.json({ success: true, id: achievementId });
  } catch (error: any) {
    console.error('Save achievement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}