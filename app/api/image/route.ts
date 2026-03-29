import { NextResponse } from 'next/server';

const apiKey = process.env.DASHSCOPE_API_KEY || '';
const dashscopeBaseUrl = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'DASHSCOPE_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { prompt } = await req.json();

    // DashScope API 图像生成
    const response = await fetch(`${dashscopeBaseUrl}/services/aigc/text2image/image-synthesis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: `以充满魔幻感、可爱且适合儿童学习的风格生成一张图片：${prompt}`
        },
        parameters: {
          style: '<auto>',
          size: '1024*1024',
          n: 1
        }
      })
    });

    const data = await response.json();
    
    // 检查响应格式，直接返回图片URL
    if (data.output && data.output.results && data.output.results[0] && data.output.results[0].url) {
      return NextResponse.json({ url: data.output.results[0].url });
    } else if (data.output && data.output.task_id) {
      // 如果仍然返回task_id，则继续轮询
      const taskId = data.output.task_id;
      let resultUrl = null;
      while (!resultUrl) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const taskResponse = await fetch(`${dashscopeBaseUrl}/tasks/${taskId}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const taskData = await taskResponse.json();
        if (taskData.output.task_status === 'SUCCEEDED') {
          resultUrl = taskData.output.results[0].url;
        } else if (taskData.output.task_status === 'FAILED') {
          throw new Error('Image generation failed');
        }
      }
      return NextResponse.json({ url: resultUrl });
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error: any) {
    console.error('Image API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
