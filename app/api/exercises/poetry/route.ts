import { error } from '../../../lib/console';
import { getErrorMessage } from '@/lib/error';
import { NextResponse } from 'next/server';

/**
 * 诗词练习生成 API
 * 
 * POST /api/exercises/poetry
 * Body: { count: number, grade: string }
 * Returns: { poetry: { title, author, dynasty, fullText, questions: [] } }
 */

const SYSTEM_PROMPT = `你是一个小学古诗词教育专家。请为小学生生成一首古诗词的练习题。

请严格按照以下 JSON 格式返回，不要添加任何其他文字：
{
  "title": "诗词标题",
  "author": "作者",
  "dynasty": "朝代",
  "fullText": "完整诗词文本（每句一行）",
  "questions": [
    {
      "id": "q1",
      "type": "fill",
      "question": "填空题描述",
      "answer": "正确答案",
      "hint": "提示或解析",
      "options": ["A. xxx", "B. xxx", "C. xxx", "D. xxx"]
    }
  ]
}

要求：
1. 选择适合小学生的经典古诗词（如李白、杜甫、白居易、王维等）
2. 生成 5 道题，混合使用以下题型：
   - fill: 填空题（如"床前__月光"，答案是"明"）
   - 选择题：options 数组包含 4 个选项
3. 答案必须准确
4. hint 要包含诗词的释义或背景知识
5. 题目要由易到难排列`;

export async function POST(req: Request) {
  const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    return NextResponse.json({ error: 'API 密钥未配置' }, { status: 500 });
  }

  try {
    const { count = 1, grade = '小学' } = await req.json();

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
          { role: 'user', content: `请为${grade}学生生成一首古诗词练习题，包含5道题目。` },
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

    let poetry: Record<string, unknown> | null = null;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        poetry = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      error('Parse AI response error:', e);
      return NextResponse.json({ error: '解析诗词数据失败', raw: content }, { status: 500 });
    }

    if (!poetry || !poetry.title || !poetry.questions) {
      return NextResponse.json({ error: 'AI 返回的数据格式不正确' }, { status: 500 });
    }

    return NextResponse.json({ poetry });
  } catch (err: unknown) {
    error('Generate poetry error:', err);
    return NextResponse.json({ error: getErrorMessage(err) || '生成失败' }, { status: 500 });
  }
}
