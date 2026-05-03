import { error } from '../../../lib/console';
import { NextResponse } from 'next/server';

/**
 * 作业识别 API
 * 
 * POST /api/homework/parse
 * Body: { image?: string (base64), text?: string }
 * Returns: { tasks: Array<{subject, title, description, dueDate}> }
 */

const SYSTEM_PROMPT = `你是一个作业识别助手。用户会上传一张作业照片或输入作业文字内容，你需要识别其中的所有作业任务，并以 JSON 数组格式返回。

每条作业任务包含以下字段：
- subject: 科目（如数学、语文、英语、科学等）
- title: 作业标题（简短描述，如"完成练习册P45"）
- description: 作业详细描述（可选）
- dueDate: 截止日期（格式：YYYY-MM-DD，默认为今天）

请严格按照以下 JSON 格式返回，不要添加任何其他文字：
[{"subject":"数学","title":"完成练习册P45第1-3题","description":"分数乘法练习题","dueDate":"2026-04-30"},...]

如果内容中没有作业信息，返回空数组 []。

注意：
- 如果用户输入的是"今天数学作业：完成练习册P45第1-3题，背诵课文《春晓》"，应该解析为2条作业
- 科目要准确识别，不要遗漏
- 标题要简洁明了，描述要详细`;

export async function POST(req: Request) {
  const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    return NextResponse.json({ error: 'API 密钥未配置' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { image, text } = body;

    if (!image && !text) {
      return NextResponse.json({ error: '请提供图片或文字内容' }, { status: 400 });
    }

    // 构建消息内容
    const content: any[] = [];
    
    if (text) {
      content.push({ type: 'text', text: `请识别以下作业内容：\n${text}` });
    }
    
    if (image) {
      content.push({ type: 'text', text: '请识别这张作业图片中的所有作业任务：' });
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${image}`,
        },
      });
    }

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
          { role: 'user', content },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      error('AI API error:', errorText);
      return NextResponse.json({ error: 'AI 识别失败' }, { status: 500 });
    }

    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content || '';

    // 从 AI 响应中提取 JSON
    let tasks: Array<{ subject: string; title: string; description?: string; dueDate?: string }> = [];
    
    try {
      // 尝试解析 JSON
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      error('Parse AI response error:', e);
      return NextResponse.json({ error: '解析作业数据失败', raw: responseContent }, { status: 500 });
    }

    return NextResponse.json({ tasks });
  } catch (error: any) {
    error('Parse homework error:', error);
    return NextResponse.json({ error: error.message || '识别失败' }, { status: 500 });
  }
}
