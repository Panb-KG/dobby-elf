import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { error } from '../../../lib/console';
import { getDb } from '../../../lib/db';
import { requireAdminAuth, adminUnauthorizedResponse } from '../../../lib/admin-auth';

/**
 * API 使用记录 API
 * 
 * GET /api/admin/api-records - 获取 API 调用记录（分页，需要管理员登录）
 */

export async function GET(req: Request) {
  // 鉴权
  const admin = requireAdminAuth(req);
  if (!admin) {
    return adminUnauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const endpoint = searchParams.get('endpoint');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minDuration = searchParams.get('minDuration');

    const db = getDb();

    let query = 'SELECT * FROM api_usage WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM api_usage WHERE 1=1';
    const params: (string | number | null | undefined)[] = [];

    if (endpoint) {
      query += ' AND endpoint = ?';
      countQuery += ' AND endpoint = ?';
      params.push(endpoint);
    }

    if (userId) {
      query += ' AND user_id = ?';
      countQuery += ' AND user_id = ?';
      params.push(userId);
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

    if (minDuration) {
      query += ' AND duration_ms >= ?';
      countQuery += ' AND duration_ms >= ?';
      params.push(parseInt(minDuration));
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const records = db.prepare(query).all(...params);
    
    // 获取总数
    const countParams = params.slice(0, params.length - 2);
    const totalResult = db.prepare(countQuery).all(...countParams) as any[];
    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      records,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err: unknown) {
    error('API records error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
