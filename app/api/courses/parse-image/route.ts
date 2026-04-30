import { NextResponse } from 'next/server';

/**
 * 课表图片识别 API
 * 
 * POST /api/courses/parse-image
 * Body: { image: string (base64) }
 * Returns: { courses: Array<{day, subject, time, type}> }
 */

const SYSTEM_PROMPT = `你是一个课表识别助手。用户会上传一张课程表图片，你需要识别其中的所有课程信息，并以 JSON 数组格式返回。

每条课程包含以下字段：
- day: 星期（周一、周二、周三、周四、周五、周六、周日）
- subject: 科目名称（如数学、语文、英语等）
- time: 时间段（如 9:00-10:00）
- type: 类型（校内 或 课外）

请严格按照以下 JSON 格式返回，不要添加任何其他文字：
[{"day":"周一","subject":"数学","time":"9:00-10:00","type":"校内"},...]

如果图片中没有课程信息，返回空数组 []。`;

export async function POST(req: Request) {
  const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    return NextResponse.json({ error: 'API 密钥未配置' }, { status: 500 });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: '请提供图片' }, { status: 400 });
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
          {
            role: 'user',
            content: [
              { type: 'text', text: '请识别这张课程表图片中的所有课程信息：' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${image}`,
                },
              },
            ],
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return NextResponse.json({ error: 'AI 识别失败' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 从 AI 响应中提取 JSON
    let courses: Array<{ day: string; subject: string; time: string; type: string }> = [];
    
    try {
      // 尝试解析 JSON
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        courses = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Parse AI response error:', e);
      return NextResponse.json({ error: '解析课表数据失败', raw: content }, { status: 500 });
    }

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('Parse course image error:', error);
    return NextResponse.json({ error: error.message || '识别失败' }, { status: 500 });
  }
}
