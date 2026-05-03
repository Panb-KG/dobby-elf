import { NextResponse } from 'next/server';
import { error } from '../../lib/console';
import { getDb, transaction } from '../../lib/db';

/**
 * 作业 CRUD API
 * 
 * GET    /api/homework?userId=xxx          - 获取作业列表
 * POST   /api/homework                      - 创建/更新作业
 * DELETE /api/homework?id=xxx&userId=xxx   - 删除作业
 * PATCH  /api/homework                      - 更新作业状态
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // 可选过滤
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    let query = `SELECT id, user_id, subject, title, description, status, due_date, image_url, created_at, updated_at FROM homework WHERE user_id = ?`;
    const params: any[] = [userId];
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY due_date ASC, created_at DESC';
    
    const tasks = db.prepare(query).all(...params);
    
    return NextResponse.json(tasks);
  } catch (error: any) {
    error('Get homework error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, task } = body;
    
    if (!userId || !task) {
      return NextResponse.json({ error: '用户ID和作业数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const taskId = task.id || `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT OR REPLACE INTO homework (id, user_id, subject, title, description, status, due_date, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      taskId,
      userId,
      task.subject,
      task.title,
      task.description || null,
      task.status || 'pending',
      task.dueDate || null,
      task.image || null
    );
    
    return NextResponse.json({ success: true, id: taskId });
  } catch (error: any) {
    error('Save homework error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, id, status } = await req.json();
    
    if (!userId || !id || !status) {
      return NextResponse.json({ error: '用户ID、作业ID和状态不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const result = db.prepare(`
      UPDATE homework SET status = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(status, id, userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Update homework error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const taskId = searchParams.get('id');
    
    if (!userId || !taskId) {
      return NextResponse.json({ error: '用户ID和作业ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM homework WHERE id = ? AND user_id = ?').run(taskId, userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Delete homework error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
