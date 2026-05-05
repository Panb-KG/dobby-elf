import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';

/**
 * 用户配置 API
 * 
 * GET    /api/users           - 获取当前用户信息（需要登录）
 * PUT    /api/users           - 更新当前用户信息（需要登录）
 * DELETE /api/users           - 删除当前用户（需要登录）
 */

export async function GET(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const db = getDb();
    const userData = db.prepare(`
      SELECT id, username, display_name, email, avatar_url, created_at, points, level, tree_growth
      FROM users WHERE id = ?
    `).get(user.userId) as any;
    
    if (!userData) {
      return unauthorizedResponse();
    }
    
    return NextResponse.json({ 
      id: userData.id, 
      username: userData.username, 
      displayName: userData.display_name,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      createdAt: userData.created_at,
      points: userData.points,
      level: userData.level,
      treeGrowth: userData.tree_growth
    });
  } catch (error: any) {
    error('Get user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // 鉴权
    const user = requireAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const { updates } = await req.json();
    
    if (!updates) {
      return NextResponse.json({ error: '更新数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    const allowedFields = ['displayName', 'email', 'avatarUrl', 'points', 'level', 'treeGrowth'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = ?`);
        values.push(updates[field]);
      }
    }
    
    fields.push("updated_at = datetime('now')");
    
    if (fields.length === 1) { // 只有 updated_at
      return NextResponse.json({ error: '没有要更新的字段' }, { status: 400 });
    }
    
    values.push(user.userId);
    
    const result = db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `).run(...values);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Update user error:', error);
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
    
    const db = getDb();
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(user.userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Delete user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
