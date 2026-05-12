import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { NextRequest } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';

/**
 * 作业 CRUD API
 * 
 * GET    /api/homework          - 获取作业列表（需要登录）
 * POST   /api/homework          - 创建/更新作业（需要登录）
 * DELETE /api/homework          - 删除作业（需要登录）
 * PATCH  /api/homework          - 更新作业状态（需要登录）
 */

export async function GET(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 可选过滤
    
    const db = getDb();
    
    let query = `SELECT id, user_id, subject, title, description, status, due_date, image_url, created_at, updated_at FROM homework WHERE user_id = ?`;
    const params: (string | number | null | undefined)[] = [user.userId];
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY due_date ASC, created_at DESC';
    
    const tasks = db.prepare(query).all(...params);
    
    return NextResponse.json(tasks);
  } catch (err: unknown) {
    error('Get homework error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const body = await req.json();
    const { task } = body;
    
    if (!task) {
      return NextResponse.json({ error: '作业数据不能为空' }, { status: 400 });
    }
    
    if (!task.title || typeof task.title !== 'string' || task.title.trim().length === 0) {
      return NextResponse.json({ error: '作业标题不能为空' }, { status: 400 });
    }
    if (task.title.length > 100) {
      return NextResponse.json({ error: '作业标题不能超过 100 字符' }, { status: 400 });
    }
    
    const db = getDb();
    
    const taskId = task.id || `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT OR REPLACE INTO homework (id, user_id, subject, title, description, status, due_date, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      taskId,
      user.userId,
      task.subject,
      task.title,
      task.description || null,
      task.status || 'pending',
      task.dueDate || null,
      task.image || null
    );
    
    return NextResponse.json({ success: true, id: taskId });
  } catch (err: unknown) {
    error('Save homework error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: '作业ID和状态不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const result = db.prepare(`
      UPDATE homework SET status = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(status, id, user.userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    error('Update homework error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
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
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: '作业ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM homework WHERE id = ? AND user_id = ?').run(taskId, user.userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    error('Delete homework error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
