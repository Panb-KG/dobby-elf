import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

/**
 * 审计日志 API
 * 
 * GET /api/admin/audit - 获取审计日志（分页）
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const action = searchParams.get('action');
    const adminId = searchParams.get('adminId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = getDb();

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (action) {
      query += ' AND action = ?';
      countQuery += ' AND action = ?';
      params.push(action);
    }

    if (adminId) {
      query += ' AND admin_id = ?';
      countQuery += ' AND admin_id = ?';
      params.push(adminId);
    }

    if (startDate) {
      query += ' AND created_at >= ?';
      countQuery += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      countQuery += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const logs = db.prepare(query).all(...params);
    
    // 获取总数（不带分页参数）
    const countParams = params.slice(0, params.length - 2);
    const totalResult = db.prepare(countQuery).all(...countParams) as any[];
    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      logs,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error: any) {
    console.error('Audit logs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
