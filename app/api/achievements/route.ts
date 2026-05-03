import { NextResponse } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';

/**
 * 成就 API
 * 
 * GET    /api/achievements?userId=xxx          - 获取成就列表
 * POST   /api/achievements                     - 创建/更新成就
 * DELETE /api/achievements?id=xxx&userId=xxx   - 删除成就
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 可选过滤
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    let query = `SELECT id, user_id, title, description, date, type, icon_name, color, points FROM achievements WHERE user_id = ?`;
    const params: any[] = [userId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY date DESC';
    
    const achievements = db.prepare(query).all(...params);
    
    return NextResponse.json(achievements);
  } catch (error: any) {
    error('Get achievements error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, achievement } = await req.json();
    
    if (!userId || !achievement) {
      return NextResponse.json({ error: '用户ID和成就数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const achievementId = achievement.id || `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT OR REPLACE INTO achievements (id, user_id, title, description, date, type, icon_name, color, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      achievementId,
      userId,
      achievement.title,
      achievement.description || null,
      achievement.date,
      achievement.type,
      achievement.iconName || null,
      achievement.color || '',
      achievement.points || 0
    );
    
    return NextResponse.json({ success: true, id: achievementId });
  } catch (error: any) {
    error('Save achievement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const achievementId = searchParams.get('id');
    
    if (!userId || !achievementId) {
      return NextResponse.json({ error: '用户ID和成就ID不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM achievements WHERE id = ? AND user_id = ?').run(achievementId, userId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '成就不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    error('Delete achievement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
