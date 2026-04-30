import { NextResponse } from 'next/server';

/**
 * 系统健康检查 API
 * 
 * GET /api/health
 * Returns: { status, uptime, database, version, timestamp }
 */

export async function GET() {
  try {
    const { getDb } = await import('../../lib/db');
    const db = getDb();
    
    // 检查数据库
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    // 统计最近 24 小时的记录
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0];
    
    const recentApiCalls = db.prepare(
      "SELECT COUNT(*) as count FROM api_usage WHERE created_at > ?"
    ).get(twentyFourHoursAgo) as { count: number };
    
    const recentErrors = db.prepare(
      "SELECT COUNT(*) as count FROM system_logs WHERE level = 'error' AND created_at > ?"
    ).get(twentyFourHoursAgo) as { count: number };
    
    const activeUsers = db.prepare(
      "SELECT COUNT(DISTINCT user_id) as count FROM api_usage WHERE created_at > ?"
    ).get(twentyFourHoursAgo) as { count: number };
    
    return NextResponse.json({
      status: 'healthy',
      uptime: process.uptime(),
      database: {
        tables: tables.length,
        status: 'connected',
      },
      stats: {
        apiCallsLast24h: recentApiCalls.count,
        errorsLast24h: recentErrors.count,
        activeUsersLast24h: activeUsers.count,
      },
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
