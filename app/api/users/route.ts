import { NextResponse } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';

/**
 * 用户配置 API
 * 
 * GET    /api/users?userId=xxx      - 获取用户信息
 * POST   /api/users                 - 创建用户
 * PUT    /api/users                 - 更新用户信息
 * DELETE /api/users?userId=xxx      - 删除用户
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const user = db.prepare(`
      SELECT id, username, display_name, email, avatar_url, created_at, points, level, tree_growth
      FROM users WHERE id = ?
    `).get(userId) as any;
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      id: user.id, 
      username: user.username, 
      displayName: user.display_name,
      email: user.email,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      points: user.points,
      level: user.level,
      treeGrowth: user.tree_growth
    });
  } catch (error: any) {
    error('Get user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await req.json();
    
    if (!user || !user.id || !user.username) {
      return NextResponse.json({ error: '用户ID和用户名不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    db.prepare(`
      INSERT OR IGNORE INTO users (id, username, display_name, email)
      VALUES (?, ?, ?, ?)
    `).run(user.id, user.username, user.displayName || user.username, user.email || null);
    
    return NextResponse.json({ success: true, id: user.id });
  } catch (error: any) {
    error('Create user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, updates } = await req.json();
    
    if (!userId || !updates) {
      return NextResponse.json({ error: '用户ID和更新数据不能为空' }, { status: 400 });
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
    
    values.push(userId);
    
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Delete user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
