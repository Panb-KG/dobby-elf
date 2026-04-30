import { NextResponse } from 'next/server';
import { getDb } from '../../lib/db';

/**
 * 题库管理 API
 * 
 * GET    /api/questions?subject=xxx&grade=xxx&topic=xxx  - 获取题库列表
 * POST   /api/questions                                  - 添加题目
 * DELETE /api/questions?id=xxx                           - 删除题目
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');
    
    const db = getDb();
    
    let query = `SELECT * FROM questions WHERE 1=1`;
    const params: any[] = [];
    
    if (subject) {
      query += ' AND subject = ?';
      params.push(subject);
    }
    
    if (grade) {
      query += ' AND grade = ?';
      params.push(grade);
    }
    
    if (topic) {
      query += ' AND topic = ?';
      params.push(topic);
    }
    
    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const questions = db.prepare(query).all(...params);
    
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error('Get questions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, grade, topic, difficulty, question, options, answer, explanation, type, source } = body;
    
    if (!subject || !grade || !topic || !question || !answer) {
      return NextResponse.json({ error: '必填字段不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT INTO questions (id, subject, grade, topic, difficulty, question, options, answer, explanation, type, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      questionId,
      subject,
      grade || '小学',
      topic,
      difficulty || 'medium',
      question,
      options ? JSON.stringify(options) : null,
      answer,
      explanation || null,
      type || 'multiple_choice',
      source || 'ai'
    );
    
    return NextResponse.json({ success: true, id: questionId });
  } catch (error: any) {
    console.error('Save question error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('id');
    
    if (!questionId) {
      return NextResponse.json({ error: '题目 ID 不能为空' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
