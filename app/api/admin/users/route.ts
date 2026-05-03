import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

/**
 * 管理员用户管理 API
 * 
 * GET    /api/admin/users              - 获取用户列表（分页）
 * GET    /api/admin/users?userId=xxx   - 获取单个用户详情
 * POST   /api/admin/users              - 创建管理员账号
 * PUT    /api/admin/users              - 更新用户/管理员
 * DELETE /api/admin/users?userId=xxx   - 删除用户
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const keyword = searchParams.get('keyword');

    const db = getDb();

    // 获取单个用户
    if (userId) {
      const user = db.prepare(`
        SELECT id, username, display_name, email, avatar_url, created_at, points, level, tree_growth
        FROM users WHERE id = ?
      `).get(userId) as any;

      if (!user) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }

      // 获取用户统计
      const stats = db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM homework WHERE user_id = ?) as homeworkCount,
          (SELECT COUNT(*) FROM achievements WHERE user_id = ?) as achievementCount,
          (SELECT COUNT(*) FROM focus_sessions WHERE user_id = ?) as focusCount,
          (SELECT COUNT(*) FROM chat_messages WHERE user_id = ?) as chatCount,
          (SELECT COUNT(*) FROM exercise_sessions WHERE user_id = ?) as exerciseCount
      `).get(userId, userId, userId, userId, userId) as any;

      return NextResponse.json({ ...user, stats });
    }

    // 获取用户列表
    let query = 'SELECT id, username, display_name, email, created_at, points, level FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params: any[] = [];

    if (keyword) {
      query += ' WHERE username LIKE ? OR display_name LIKE ? OR email LIKE ?';
      countQuery += ' WHERE username LIKE ? OR display_name LIKE ? OR email LIKE ?';
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const users = db.prepare(query).all(...params);
    const totalResult = db.prepare(countQuery).all(...params.slice(0, keyword ? 3 : 0)) as any[];
    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      users,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error: any) {
    error('Admin users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, password, displayName, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const db = getDb();

    // 检查是否已有该管理员
    const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminId = `admin_${Date.now()}`;

    db.prepare(`
      INSERT INTO admins (id, username, password, display_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, username, hashedPassword, displayName || username, role || 'admin');

    return NextResponse.json({ success: true, id: adminId });
  } catch (error: any) {
    error('Create admin error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, updates, isAdmin } = await req.json();

    if (!userId || !updates) {
      return NextResponse.json({ error: '用户ID和更新数据不能为空' }, { status: 400 });
    }

    const db = getDb();
    const table = isAdmin ? 'admins' : 'users';

    const allowedFields = isAdmin
      ? ['display_name', 'role', 'is_active']
      : ['display_name', 'email', 'avatar_url', 'points', 'level', 'tree_growth'];

    const fields: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (updates[camelField] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[camelField]);
      }
    }

    // 如果更新了密码
    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    fields.push("updated_at = datetime('now')");
    values.push(userId);

    const result = db.prepare(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Update user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }

    const db = getDb();
    const table = isAdmin ? 'admins' : 'users';
    const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(userId);

    if (result.changes === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: result.changes });
  } catch (error: any) {
    error('Delete user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { error } from '../../../lib/console';
import bcrypt from 'bcrypt';
