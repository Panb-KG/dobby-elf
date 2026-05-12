import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { NextRequest } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';

/**
 * 知识图谱 API
 * 
 * GET    /api/knowledge          - 获取知识图谱（需要登录）
 * POST   /api/knowledge          - 更新知识图谱（需要登录）
 */

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return unauthorizedResponse();
    
    const db = getDb();
    const points = db.prepare(`
      SELECT id, name, status, subject FROM knowledge_points WHERE user_id = ?
    `).all(user.userId);
    
    return NextResponse.json(points);
  } catch (err: unknown) {
    error('Get knowledge points error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return unauthorizedResponse();
    
    const { points } = await req.json();
    
    if (!points) {
      return NextResponse.json({ error: '知识点数据不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Delete existing points for user
    db.prepare('DELETE FROM knowledge_points WHERE user_id = ?').run(user.userId);
    
    // Insert new points
    const insertPoint = db.prepare(`
      INSERT INTO knowledge_points (id, user_id, name, status, subject)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    points.forEach((point: { id?: string; name: string; status: string; subject: string }) => {
      const pointId = point.id || `point_${Date.now()}_${Math.random()}`;
      insertPoint.run(pointId, user.userId, point.name, point.status, point.subject);
    });
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    error('Save knowledge points error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
