import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

/**
 * 系统设置 API
 * 
 * GET  /api/admin/settings        - 获取所有设置
 * GET  /api/admin/settings?key=xx - 获取单个设置
 * POST /api/admin/settings        - 更新设置
 * PUT  /api/admin/settings        - 批量更新设置
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    const db = getDb();

    if (key) {
      const setting = db.prepare('SELECT * FROM system_settings WHERE key = ?').get(key) as any;
      return NextResponse.json(setting || null);
    }

    const settings = db.prepare('SELECT * FROM system_settings').all();
    const result: Record<string, any> = {};
    
    for (const s of settings as any[]) {
      try {
        result[s.key] = JSON.parse(s.value);
      } catch {
        result[s.key] = s.value;
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();

    // 支持单个或批量更新
    const entries = Array.isArray(body) ? body : Object.entries(body).map(([key, value]) => ({ key, value }));

    for (const entry of entries) {
      const key = entry.key || entry[0];
      const value = entry.value !== undefined ? entry.value : entry[1];
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

      db.prepare(`
        INSERT OR REPLACE INTO system_settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `).run(key, valueStr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req); // 同 POST
}
