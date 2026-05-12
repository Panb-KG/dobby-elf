import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { NextRequest } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';

/**
 * 练习记录 API
 * 
 * GET    /api/exercises          - 获取练习记录列表（需要登录）
 * POST   /api/exercises          - 创建练习记录（需要登录）
 * PATCH  /api/exercises          - 更新练习记录（需要登录）
 */

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return unauthorizedResponse();
    
    const db = getDb();
    
    const sessions = db.prepare(`
      SELECT * FROM exercise_sessions 
      WHERE user_id = ? 
      ORDER BY started_at DESC
    `).all(user.userId);
    
    return NextResponse.json(sessions);
  } catch (err: unknown) {
    error('Get exercises error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return unauthorizedResponse();
    
    const body = await req.json();
    const { subject, topic, totalQuestions } = body;
    
    if (!subject || !topic || !totalQuestions) {
      return NextResponse.json({ error: '必填字段不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const sessionId = `session_${Date.now()}`;
    
    db.prepare(`
      INSERT INTO exercise_sessions (id, user_id, subject, topic, total_questions)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, user.userId, subject, topic, totalQuestions);
    
    return NextResponse.json({ success: true, id: sessionId });
  } catch (err: unknown) {
    error('Create exercise session error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return unauthorizedResponse();
    
    const body = await req.json();
    const { sessionId, correctAnswers, score, completed, answers } = body;
    
    if (!sessionId) {
      return NextResponse.json({ error: '练习记录 ID 不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    // 验证会话属于当前用户
    const session = db.prepare('SELECT * FROM exercise_sessions WHERE id = ? AND user_id = ?').get(sessionId, user.userId);
    if (!session) {
      return NextResponse.json({ error: '练习记录不存在' }, { status: 404 });
    }
    
    // 更新练习记录
    if (correctAnswers !== undefined || score !== undefined || completed !== undefined) {
      db.prepare(`
        UPDATE exercise_sessions 
        SET correct_answers = COALESCE(?, correct_answers),
            score = COALESCE(?, score),
            completed = COALESCE(?, completed),
            completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END
        WHERE id = ?
      `).run(correctAnswers, score, completed, completed, sessionId);
    }
    
    // 保存答案
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        const answerId = `ans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.prepare(`
          INSERT INTO exercise_answers (id, session_id, question_id, user_answer, is_correct)
          VALUES (?, ?, ?, ?, ?)
        `).run(answerId, sessionId, answer.questionId, answer.userAnswer, answer.isCorrect ? 1 : 0);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    error('Update exercise session error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
