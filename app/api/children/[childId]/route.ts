import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { getDb } from '../../../lib/db';
import { error, info } from '../../../lib/console';
import { authenticateRequest } from '../../../lib/auth';

/**
 * GET /api/children/[childId] - 获取单个孩子详情
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await context.params;

    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
    }

    const db = getDb();

    // 确认是家长角色
    const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(auth.userId) as any;
    if (!currentUser || currentUser.role !== 'parent') {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const child = db.prepare(`
      SELECT id, username, display_name, child_name, grade, pin_code, avatar_url,
             is_active, points, level, tree_growth, created_at
      FROM users
      WHERE id = ? AND role = 'child' AND parent_id = ?
    `).get(childId, auth.userId) as any;

    if (!child) {
      return NextResponse.json({ error: '孩子账号不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      child: {
        id: child.id,
        username: child.username,
        displayName: child.display_name,
        childName: child.child_name,
        grade: child.grade,
        pinCode: child.pin_code ? `${child.pin_code.slice(0, 2)}****` : '',
        avatarUrl: child.avatar_url,
        isActive: child.is_active === 1,
        points: child.points,
        level: child.level,
        treeGrowth: child.tree_growth,
        createdAt: child.created_at,
      }
    });
  } catch (err: unknown) {
    error('Get child error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

/**
 * PATCH /api/children/[childId] - 更新孩子信息（年级、PIN、状态等）
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await context.params;

    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
    }

    const db = getDb();

    // 确认是家长角色
    const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(auth.userId) as any;
    if (!currentUser || currentUser.role !== 'parent') {
      return NextResponse.json({ error: '无权限操作' }, { status: 403 });
    }

    // 确认孩子属于该家长
    const child = db.prepare(`
      SELECT id FROM users WHERE id = ? AND role = 'child' AND parent_id = ?
    `).get(childId, auth.userId);

    if (!child) {
      return NextResponse.json({ error: '孩子账号不存在' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    const body = await req.json();

    if (body.grade) {
      updates.push('grade = ?');
      values.push(body.grade);
    }

    if (body.pinCode) {
      if (!/^\d{4,6}$/.test(body.pinCode)) {
        return NextResponse.json({ error: 'PIN 码为 4-6 位数字' }, { status: 400 });
      }
      // 检查 PIN 是否被其他孩子使用
      const existingPin = db.prepare(
        "SELECT id FROM users WHERE parent_id = ? AND pin_code = ? AND role = 'child' AND id != ?"
      ).get(auth.userId, body.pinCode, childId);
      if (existingPin) {
        return NextResponse.json({ error: '该 PIN 码已被其他孩子使用' }, { status: 409 });
      }
      updates.push("pin_code = ?", "password = ?");
      values.push(body.pinCode, body.pinCode);
    }

    if (typeof body.isActive === 'boolean') {
      updates.push('is_active = ?');
      values.push(body.isActive ? 1 : 0);
    }

    if (body.childName) {
      updates.push('child_name = ?', 'display_name = ?');
      values.push(body.childName.trim(), body.childName.trim());
    }

    if (body.avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(body.avatarUrl);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: '没有需要更新的字段' }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(childId);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    info(`家长 ${auth.userId} 更新了孩子 ${childId} 的信息`);

    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (err: unknown) {
    error('Update child error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

/**
 * DELETE /api/children/[childId] - 停用孩子账号（软删除）
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await context.params;

    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
    }

    const db = getDb();

    // 确认是家长角色
    const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(auth.userId) as any;
    if (!currentUser || currentUser.role !== 'parent') {
      return NextResponse.json({ error: '无权限操作' }, { status: 403 });
    }

    // 确认孩子属于该家长
    const child = db.prepare(`
      SELECT id FROM users WHERE id = ? AND role = 'child' AND parent_id = ?
    `).get(childId, auth.userId);

    if (!child) {
      return NextResponse.json({ error: '孩子账号不存在' }, { status: 404 });
    }

    // 软删除：停用而非物理删除
    db.prepare(`
      UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?
    `).run(childId);

    info(`家长 ${auth.userId} 停用了孩子账号 ${childId}`);

    return NextResponse.json({ success: true, message: '孩子账号已停用' });
  } catch (err: unknown) {
    error('Delete child error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
