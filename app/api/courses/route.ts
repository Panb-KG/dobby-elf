import { NextResponse } from 'next/server';
import { getDb } from '../../lib/db';

/**
 * 课程 CRUD API
 * 
 * GET    /api/courses?userId=xxx        - 获取课程表
 * POST   /api/courses                   - 创建/更新课程
 * DELETE /api/courses?id=xxx&userId=xxx - 删除课程
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const courses = db.prepare(`
      SELECT id, user_id, day, subject, time, type, color FROM courses WHERE user_id = ?
      ORDER BY 
        CASE day
          WHEN '周一' THEN 1 WHEN '周二' THEN 2 WHEN '周三' THEN 3
          WHEN '周四' THEN 4 WHEN '周五' THEN 5 WHEN '周六' THEN 6 WHEN '周日' THEN 7
          ELSE 8
        END,
        time ASC
    `).all(userId);
    
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
    const courseId = searchParams.get('id');
    
    if (!userId || !courseId) {
      return NextResponse.json({ error: '用户ID和课程ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM courses WHERE id = ? AND user_id = ?').run(courseId, userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
