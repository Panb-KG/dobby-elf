import { error } from '../../lib/console';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';

/**
 * Chat API - 多比智能聊天
 * 
 * 功能：
 * - 接收前端消息并转发给 DashScope API
 * - 支持文件附件（图片、文档）
 * - 返回 NDJSON 格式响应
 * - 需要登录认证
 */

export async function POST(req: NextRequest) {
  // 鉴权
  const user = requireAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';

  if (!apiKey || !apiKey.trim()) {
    return NextResponse.json(
      { error: 'API 密钥未配置，请联系管理员' },
      { status: 500 }
    );
  }

  try {
    const { messages, systemInstruction, tools } = await req.json();

    // 处理消息格式（支持文件附件）
    const processedMessages = messages
      .map((msg: any) => {
        const role = msg.role === 'model' ? 'assistant' : msg.role;
        const text = msg.content || msg.text;
        
        // 处理带附件的消息
        if (msg.files && msg.files.length > 0) {
          const content: any[] = [];
          
          if (text && text.trim()) {
            content.push({ type: 'text', text });
          }
          
          for (const file of msg.files) {
            if (file.mimeType && file.mimeType.startsWith('image/') && file.data) {
              content.push({
                type: 'image_url',
                image_url: {
                  url: `data:${file.mimeType};base64,${file.data}`
                }
              });
            }
          }
          
          if (content.length > 0) {
            return { role, content };
          }
          return null;
        }
        
        if (text && text.trim()) {
          return { role, content: text };
        }
        return null;
      })
      .filter((msg: any) => msg !== null);

    if (processedMessages.length === 0) {
      return NextResponse.json(
        { error: '没有有效消息' },
        { status: 400 }
      );
    }

    const model = 'qwen3.6-plus';
    const apiEndpoint = baseUrl + '/chat/completions';

    const requestBody: any = {
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        ...processedMessages
      ],
      stream: true,  // 启用流式响应，降低首字延迟
      max_tokens: 2048,  // 限制最大输出 token 数
      temperature: 0.7,  // 平衡创造性和稳定性
    };

    // 添加工具定义（如果提供）
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      // @ts-ignore - signal 是 fetch 标准参数
      signal: AbortSignal.timeout(60000), // 60秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        const error = JSON.parse(errorText);
        if (error.error && error.error.code === 'invalid_api_key') {
          return NextResponse.json(
            { error: 'API 密钥无效，请联系管理员' },
            { status: 401 }
          );
        }
        throw new Error(error.error?.message || error.message || 'API 请求失败');
      } catch (e: any) {
        throw new Error(e.message || `API 错误: ${response.status}`);
      }
    }

    // 流式响应：逐 chunk 转发给前端
    const stream = response.body;
    if (!stream) {
      throw new Error('API 响应没有 body');
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    error('Chat API error:', error.message);
    return NextResponse.json(
      { error: error.message || '魔法出错了，请稍后再试' },
      { status: 500 }
    );
  }
}
