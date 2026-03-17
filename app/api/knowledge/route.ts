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
    const points = db.prepare(`
      SELECT id, name, status, subject FROM knowledge_points WHERE user_id = ?
    `).all(userId);
    
    db.close();
    
    return NextResponse.json(points);
  } catch (error: any) {
    console.error('Get knowledge points error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, points } = await req.json();
    
    if (!userId || !points) {
      return NextResponse.json({ error: '用户ID和知识点数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Delete existing points for user
    db.prepare('DELETE FROM knowledge_points WHERE user_id = ?').run(userId);
    
    // Insert new points
    const insertPoint = db.prepare(`
      INSERT INTO knowledge_points (id, user_id, name, status, subject)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    points.forEach((point: any) => {
      const pointId = point.id || `point_${Date.now()}_${Math.random()}`;
      insertPoint.run(pointId, userId, point.name, point.status, point.subject);
    });
    
    db.close();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save knowledge points error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}