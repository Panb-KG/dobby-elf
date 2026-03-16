import { NextResponse } from 'next/server';

const apiKey = process.env.BAILIAN_API_KEY || process.env.DASHSCOPE_API_KEY;
const isBailian = !!process.env.BAILIAN_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'BAILIAN_API_KEY or DASHSCOPE_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { prompt } = await req.json();

    // 阿里百炼API图像生成
    if (isBailian) {
      const response = await fetch(`${process.env.BAILIAN_BASE_URL || 'https://bailian.aliyun.com/api/v1'}/services/aigc/text2image/image-synthesis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
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
      const taskId = data.output.task_id;

      // Poll for task completion
      let resultUrl = null;
      while (!resultUrl) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const taskResponse = await fetch(`${process.env.BAILIAN_BASE_URL || 'https://bailian.aliyun.com/api/v1'}/tasks/${taskId}`, {
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
      // 保持原有的DashScope API调用
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
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
      const taskId = data.output.task_id;

      // Poll for task completion
      let resultUrl = null;
      while (!resultUrl) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const taskResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
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
    }
  } catch (error: any) {
    console.error('Image API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
