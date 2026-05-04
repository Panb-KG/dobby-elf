import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';

/**
 * 课程 CRUD API
 * 
 * GET    /api/courses        - 获取课程表（需要登录）
 * POST   /api/courses        - 创建/更新课程（需要登录）
 * DELETE /api/courses        - 删除课程（需要登录）
 */

export async function GET(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
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
    `).all(user.userId);
    
    return NextResponse.json(courses);
  } catch (error: any) {
    error('Get courses error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const { course } = await req.json();
    
    if (!course) {
      return NextResponse.json({ error: '课程数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const courseId = course.id || `course_${Date.now()}`;
    
    db.prepare(`
      INSERT OR REPLACE INTO courses (id, user_id, day, subject, time, type, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(courseId, user.userId, course.day, course.subject, course.time, course.type, course.color || '');
    
    return NextResponse.json({ success: true, id: courseId });
  } catch (error: any) {
    error('Save course error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('id');
    
    if (!courseId) {
      return NextResponse.json({ error: '课程ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM courses WHERE id = ? AND user_id = ?').run(courseId, user.userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Delete course error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
