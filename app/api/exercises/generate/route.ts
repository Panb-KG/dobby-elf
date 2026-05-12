import { error } from '../../../lib/console';
import { getErrorMessage } from '@/lib/error-helper';
import { NextResponse } from 'next/server';

/**
 * 练习题生成 API
 * 
 * POST /api/exercises/generate
 * Body: { subject: string, grade: string, topic: string, count: number, difficulty: string }
 * Returns: { questions: Array<{id, question, options, answer, explanation}> }
 */

const SYSTEM_PROMPT = `你是一个小学题库专家。请根据用户提供的科目、年级、知识点和难度，生成高质量的练习题。

每条题目包含以下字段：
- id: 题目 ID（如 math_1, math_2）
- question: 题目内容
- options: 选项数组（4 个选项，A/B/C/D）
- answer: 正确答案（选项字母）
- explanation: 详细解析

请严格按照以下 JSON 格式返回，不要添加任何其他文字：
[{"id":"math_1","question":"2+3=？","options":["A. 4","B. 5","C. 6","D. 7"],"answer":"B","explanation":"2+3=5，选 B"}]

要求：
- 题目要符合小学 3-5 年级水平
- 选项要有干扰性但不过于相似
- 解析要详细且易懂
- 难度要符合要求（easy/medium/hard）`;

export async function POST(req: Request) {
  const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    return NextResponse.json({ error: 'API 密钥未配置' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { subject, grade, topic, count, difficulty } = body;

    if (!subject || !topic) {
      return NextResponse.json({ error: '科目和知识点不能为空' }, { status: 400 });
    }

    const prompt = `请生成 ${count || 5} 道${grade || '小学'}${subject}练习题，知识点：${topic}，难度：${difficulty || 'medium'}。`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3.6-plus',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      error('AI API error:', errorText);
      return NextResponse.json({ error: 'AI 生成失败' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 从 AI 响应中提取 JSON
    let questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> = [];
    
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      error('Parse AI response error:', e);
      return NextResponse.json({ error: '解析题目数据失败', raw: content }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (err: unknown) {
    error('Generate exercises error:', err);
    return NextResponse.json({ error: getErrorMessage(err) || '生成失败' }, { status: 500 });
  }
}
