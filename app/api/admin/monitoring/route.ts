import { NextResponse } from 'next/server';
import { error } from '../../../lib/console';
import { getDb } from '../../../lib/db';

/**
 * 系统监控 API
 * 
 * GET /api/admin/monitoring - 获取系统监控数据
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '24h';

    const db = getDb();

    // 计算时间范围
    const now = new Date();
    const hoursAgo = range === '1h' ? 1 : range === '6h' ? 6 : range === '24h' ? 24 : 7 * 24;
    const startTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0];

    // API 调用统计
    const apiStats = db.prepare(`
      SELECT 
        COUNT(*) as totalCalls,
        AVG(duration_ms) as avgDuration,
        MAX(duration_ms) as maxDuration,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errorCount
      FROM api_usage WHERE created_at > ?
    `).get(startTime) as any;

    // 按小时统计 API 调用
    const apiHourly = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d %H:00', created_at) as hour,
        COUNT(*) as calls,
        AVG(duration_ms) as avgDuration,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors
      FROM api_usage 
      WHERE created_at > ?
      GROUP BY hour
      ORDER BY hour
    `).all(startTime) as any[];

    // 错误统计
    const errorStats = db.prepare(`
      SELECT 
        level,
        COUNT(*) as count
      FROM system_logs 
      WHERE created_at > ?
      GROUP BY level
    `).all(startTime) as any[];

    // 最近错误
    const recentErrors = db.prepare(`
      SELECT id, level, category, message, created_at
      FROM system_logs 
      WHERE level = 'error'
      ORDER BY created_at DESC
      LIMIT 20
    `).all() as any[];

    // 数据库大小
    const dbSize = db.prepare(`
      SELECT page_count * page_size as size
      FROM pragma_page_count(), pragma_page_size()
    `).get() as any;

    // 用户活跃度
    const userActivity = db.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as activeUsers,
        COUNT(*) as totalMessages
      FROM chat_messages 
      WHERE timestamp > ?
    `).get(startTime) as any;

    // 练习统计
    const exerciseStats = db.prepare(`
      SELECT 
        COUNT(*) as totalSessions,
        AVG(CAST(score AS FLOAT) / total_questions * 100) as avgScore,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedSessions
      FROM exercise_sessions
      WHERE started_at > ?
    `).get(startTime) as any;

    return NextResponse.json({
      api: {
        totalCalls: apiStats.totalCalls || 0,
        avgDuration: Math.round(apiStats.avgDuration || 0),
        maxDuration: apiStats.maxDuration || 0,
        errorCount: apiStats.errorCount || 0,
        hourly: apiHourly,
      },
      errors: {
        byLevel: errorStats,
        recent: recentErrors,
      },
      database: {
        size: dbSize.size || 0,
        sizeMB: Math.round((dbSize.size || 0) / 1024 / 1024 * 100) / 100,
      },
      users: {
        activeUsers: userActivity.activeUsers || 0,
        totalMessages: userActivity.totalMessages || 0,
      },
      exercises: {
        totalSessions: exerciseStats.totalSessions || 0,
        avgScore: Math.round(exerciseStats.avgScore || 0),
        completedSessions: exerciseStats.completedSessions || 0,
      },
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    error('Monitoring error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
