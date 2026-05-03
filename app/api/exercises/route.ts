import { NextResponse } from 'next/server';
import { error } from '../../lib/console';
import { getDb } from '../../lib/db';

/**
 * 练习记录 API
 * 
 * GET    /api/exercises?userId=xxx          - 获取练习记录列表
 * POST   /api/exercises                     - 创建练习记录
 * PATCH  /api/exercises                     - 更新练习记录
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '用户 ID 不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
    const sessions = db.prepare(`
      SELECT * FROM exercise_sessions 
      WHERE user_id = ? 
      ORDER BY started_at DESC
    `).all(userId);
    
    return NextResponse.json(sessions);
  } catch (error: any) {
    error('Get exercises error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, subject, topic, totalQuestions } = body;
    
    if (!userId || !subject || !topic || !totalQuestions) {
      return NextResponse.json({ error: '必填字段不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const sessionId = `session_${Date.now()}`;
    
    db.prepare(`
      INSERT INTO exercise_sessions (id, user_id, subject, topic, total_questions)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, userId, subject, topic, totalQuestions);
    
    return NextResponse.json({ success: true, id: sessionId });
  } catch (error: any) {
    error('Create exercise session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, correctAnswers, score, completed, answers } = body;
    
    if (!sessionId) {
      return NextResponse.json({ error: '练习记录 ID 不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    
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
  } catch (error: any) {
    error('Update exercise session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
