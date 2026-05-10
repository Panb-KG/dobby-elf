import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error';
import { error } from '../../../lib/console';
import { getDb } from '../../../lib/db';
import { requireAdminAuth, adminUnauthorizedResponse } from '../../../lib/admin-auth';

/**
 * 定时任务管理 API
 * 
 * GET    /api/admin/tasks              - 获取任务列表（需要管理员登录）
 * POST   /api/admin/tasks              - 创建任务
 * PUT    /api/admin/tasks              - 更新任务
 * DELETE /api/admin/tasks?id=xxx       - 删除任务
 * POST   /api/admin/tasks?id=xxx/run   - 手动执行任务
 */

export async function GET(req: Request) {
  // 鉴权
  const admin = requireAdminAuth(req);
  if (!admin) {
    return adminUnauthorizedResponse();
  }

  try {
    const db = getDb();
    const tasks = db.prepare(`
      SELECT * FROM scheduled_tasks ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    error('Get tasks error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // 鉴权
  const admin = requireAdminAuth(req);
  if (!admin) {
    return adminUnauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(req.url);
    const runTaskId = searchParams.get('id');
    const action = searchParams.get('action');
    
    const db = getDb();

    // 手动执行任务
    if (action === 'run' && runTaskId) {
      const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(runTaskId) as any;
      if (!task) {
        return NextResponse.json({ error: '任务不存在' }, { status: 404 });
      }

      const executionId = `exec_${Date.now()}`;
      const startTime = new Date().toISOString().replace('T', ' ').split('.')[0];

      // 记录执行
      db.prepare(`
        INSERT INTO task_executions (id, task_id, started_at, status)
        VALUES (?, ?, ?, 'running')
      `).run(executionId, runTaskId, startTime);

      // 更新任务
      db.prepare(`
        UPDATE scheduled_tasks SET last_run = ?, run_count = run_count + 1
        WHERE id = ?
      `).run(startTime, runTaskId);

      return NextResponse.json({ success: true, executionId });
    }

    // 创建任务
    const { name, description, cron, handler } = await req.json();
    
    if (!name || !cron || !handler) {
      return NextResponse.json({ error: '名称、cron 表达式和处理器不能为空' }, { status: 400 });
    }

    const newTaskId = `task_${Date.now()}`;
    
    db.prepare(`
      INSERT INTO scheduled_tasks (id, name, description, cron, handler)
      VALUES (?, ?, ?, ?, ?)
    `).run(newTaskId, name, description || '', cron, handler);

    return NextResponse.json({ success: true, id: newTaskId });
  } catch (err: unknown) {
    error('Task error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // 鉴权
  const admin = requireAdminAuth(req);
  if (!admin) {
    return adminUnauthorizedResponse();
  }

  try {
    const { id, updates } = await req.json();
    
    if (!id || !updates) {
      return NextResponse.json({ error: '任务ID和更新数据不能为空' }, { status: 400 });
    }

    const db = getDb();
    const allowedFields = ['name', 'description', 'cron', 'handler', 'status'];
    const fields: string[] = [];
    const values: (string | number | null | undefined)[] = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const result = db.prepare(`
      UPDATE scheduled_tasks SET ${fields.join(', ')} WHERE id = ?
    `).run(...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    error('Update task error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // 鉴权
  const admin = requireAdminAuth(req);
  if (!admin) {
    return adminUnauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '任务ID不能为空' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    error('Delete task error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
