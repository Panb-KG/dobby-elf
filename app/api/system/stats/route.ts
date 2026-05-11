import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error';
import { error } from '../../../lib/console';
import { getDb } from '../../../lib/db';

/**
 * 系统统计 API
 * 
 * GET /api/system/stats
 * Returns: { apiUsage, errors, users, courses, homework, exercises }
 */

export async function GET(req: Request) {
  try {
    const db = getDb();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().replace('T', ' ').split('.')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0];
    
    // API 使用统计
    const apiToday = db.prepare(
      "SELECT endpoint, COUNT(*) as count FROM api_usage WHERE created_at > ? GROUP BY endpoint ORDER BY count DESC"
    ).all(today) as Array<{ endpoint: string; count: number }>;
    
    const apiWeekTotal = db.prepare(
      "SELECT COUNT(*) as total FROM api_usage WHERE created_at > ?"
    ).get(weekAgo) as { total: number };
    
    // 错误统计
    const errorsToday = db.prepare(
      "SELECT COUNT(*) as count FROM system_logs WHERE level = 'error' AND created_at > ?"
    ).get(today) as { count: number };
    
    const errorsWeek = db.prepare(
      "SELECT COUNT(*) as count FROM system_logs WHERE level = 'error' AND created_at > ?"
    ).get(weekAgo) as { count: number };
    
    // 最近错误
    const recentErrors = db.prepare(
      "SELECT message, category, created_at FROM system_logs WHERE level = 'error' ORDER BY created_at DESC LIMIT 10"
    ).all() as Array<{ message: string; category: string; created_at: string }>;
    
    // 用户统计
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    const activeUsers = db.prepare(
      "SELECT COUNT(DISTINCT user_id) as count FROM api_usage WHERE created_at > ?"
    ).get(weekAgo) as { count: number };
    
    // 课程统计
    const totalCourses = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };
    
    // 作业统计
    const pendingHomework = db.prepare(
      "SELECT COUNT(*) as count FROM homework WHERE status = 'pending'"
    ).get() as { count: number };
    const completedHomework = db.prepare(
      "SELECT COUNT(*) as count FROM homework WHERE status = 'completed'"
    ).get() as { count: number };
    
    // 练习统计
    const totalSessions = db.prepare("SELECT COUNT(*) as count FROM exercise_sessions").get() as { count: number };
    const avgScore = db.prepare(
      "SELECT AVG(CAST(score AS FLOAT) / total_questions * 100) as avg FROM exercise_sessions WHERE completed = 1 AND total_questions > 0"
    ).get() as { avg: number | null };
    
    // 诗词练习
    const poetryQuestions = db.prepare(
      "SELECT COUNT(*) as count FROM questions WHERE subject = '语文'"
    ).get() as { count: number };
    
    return NextResponse.json({
      api: {
        today: apiToday,
        weekTotal: apiWeekTotal.total,
      },
      errors: {
        today: errorsToday.count,
        week: errorsWeek.count,
        recent: recentErrors,
      },
      users: {
        total: totalUsers.count,
        activeThisWeek: activeUsers.count,
      },
      content: {
        courses: totalCourses.count,
        homeworkPending: pendingHomework.count,
        homeworkCompleted: completedHomework.count,
        exerciseSessions: totalSessions.count,
        avgScore: avgScore.avg ? Math.round(avgScore.avg) : 0,
        poetryQuestions: poetryQuestions.count,
      },
      timestamp: now.toISOString(),
    });
  } catch (err: unknown) {
    error('Get system stats error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
