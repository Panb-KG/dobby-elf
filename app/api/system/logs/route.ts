import { NextResponse } from 'next/server';
import { error } from '../../../lib/console';
import { getDb } from '../../../lib/db';

/**
 * 系统日志 API
 * 
 * GET    /api/system/logs?level=info&category=system&limit=50
 * POST   /api/system/logs
 * DELETE /api/system/logs?before=timestamp
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const db = getDb();
    
    let query = 'SELECT * FROM system_logs WHERE 1=1';
    const params: any[] = [];
    
    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    const logs = db.prepare(query).all(...params);
    
    return NextResponse.json(logs);
  } catch (error: any) {
    error('Get system logs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { level, category, message, details } = body;
    
    if (!message) {
      return NextResponse.json({ error: '日志内容不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(
      'INSERT INTO system_logs (id, level, category, message, details) VALUES (?, ?, ?, ?, ?)'
    ).run(
      logId,
      level || 'info',
      category || 'system',
      message,
      details ? JSON.stringify(details) : null
    );
    
    return NextResponse.json({ success: true, id: logId });
  } catch (error: any) {
    error('Create log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const before = searchParams.get('before');
    
    if (!before) {
      return NextResponse.json({ error: '请指定删除时间' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM system_logs WHERE created_at < ?').run(before);
    
    return NextResponse.json({ success: true, deleted: result.changes });
  } catch (error: any) {
    error('Delete logs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
