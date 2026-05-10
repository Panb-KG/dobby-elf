import { error, log } from '../../lib/console';
import { getErrorMessage } from '@/lib/error';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';

export async function POST(req: NextRequest) {
  // 鉴权
  const user = requireAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    return NextResponse.json({ error: 'TOKEN_PLAN_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { prompt } = await req.json();

    // 使用 qwen-image-2.0 通过 OpenAI 兼容 API 生成图片
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-image-2.0',
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: `以充满魔幻感、可爱且适合儿童学习的风格生成一张图片：${prompt}` }]
        }]
      })
    });

    const data = await response.json();
    log('Image API response status:', response.status);

    // 处理 qwen-image-2.0 响应格式
    if (data.output?.choices?.[0]?.message?.content?.[0]?.image) {
      const imageUrl = data.output.choices[0].message.content[0].image;
      log('Image generated:', imageUrl.substring(0, 100) + '...');
      return NextResponse.json({ url: imageUrl });
    } else if (data.code) {
      throw new Error(`${data.code}: ${data.message}`);
    } else {
      error('Unexpected response:', JSON.stringify(data).substring(0, 500));
      throw new Error('Invalid API response format');
    }
  } catch (err: unknown) {
    error('Image API error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
