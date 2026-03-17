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
    const courses = db.prepare(`
      SELECT id, day, subject, time, type, color FROM courses WHERE user_id = ?
    `).all(userId);
    
    db.close();
    
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Get courses error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, course } = await req.json();
    
    if (!userId || !course) {
      return NextResponse.json({ error: '用户ID和课程数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const courseId = course.id || `course_${Date.now()}`;
    
    db.prepare(`
      INSERT OR REPLACE INTO courses (id, user_id, day, subject, time, type, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(courseId, userId, course.day, course.subject, course.time, course.type, course.color || '');
    
    db.close();
    
    return NextResponse.json({ success: true, id: courseId });
  } catch (error: any) {
    console.error('Save course error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    
    if (!userId || !courseId) {
      return NextResponse.json({ error: '用户ID和课程ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    db.prepare('DELETE FROM courses WHERE id = ? AND user_id = ?').run(courseId, userId);
    db.close();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}