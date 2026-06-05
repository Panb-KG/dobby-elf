import { getErrorMessage } from '@/lib/error-helper';
import { validateBody, validationError, validators } from '@/lib/validate';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '../../lib/api-auth';
import { error as logError } from '../../lib/console';

// ===== 类型定义 =====

interface ChatMessage {
  role: string;
  content?: string;
  text?: string;
  files?: Array<{ mimeType: string; data: string }>;
}

interface ChatApiError {
  error?: { code?: string; message?: string };
  message?: string;
}

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
    const body = await req.json() as { messages?: ChatMessage[]; systemInstruction?: string; tools?: unknown[]; model?: string };
    const { messages, systemInstruction, tools } = body;

    // 输入校验
    const messagesArray = messages || [];
    if (messagesArray.length === 0) {
      return NextResponse.json({ error: 'messages 不能为空' }, { status: 400 });
    }
    if (messagesArray.length > 50) {
      return NextResponse.json({ error: '消息数量不能超过 50 条' }, { status: 400 });
    }

    // 处理消息格式（支持文件附件）
    const processedMessages = (messages || [])
      .map((msg: ChatMessage) => {
        const role = msg.role === 'model' ? 'assistant' : msg.role;
        const text = msg.content || msg.text;
        
        // 处理带附件的消息
        if (msg.files && msg.files.length > 0) {
          const content: Array<{ type: string; text?: string; image?: string }> = [];
          
          if (text && text.trim()) {
            content.push({ type: 'text', text });
          }
          
          for (const file of msg.files) {
            if (file.mimeType && file.mimeType.startsWith('image/') && file.data) {
              content.push({
                type: 'image',
                image: file.data
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
      .filter((msg): msg is NonNullable<typeof msg> => msg !== null);

    if (processedMessages.length === 0) {
      return NextResponse.json(
        { error: '没有有效消息' },
        { status: 400 }
      );
    }

    // 输入校验：消息数量限制
    if (processedMessages.length > 50) {
      return NextResponse.json(
        { error: '消息数量过多，请精简对话历史' },
        { status: 400 }
      );
    }

    // 输入校验：单条消息长度限制
    for (const msg of processedMessages) {
      if (!msg) continue;
      const msgContent = 'content' in msg ? msg.content : '';
      const textContent = typeof msgContent === 'string' ? msgContent : '';
      if (textContent.length > 8000) {
        return NextResponse.json(
          { error: '单条消息过长' },
          { status: 400 }
        );
      }
    }

    const requestBody: {
      model: string;
      messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image?: string }> }>;
      stream: boolean;
      max_tokens: number;
      temperature: number;
      tools?: unknown[];
    } = {
      model: body.model || 'qwen3.6-plus',
      messages: [
        { role: 'system', content: systemInstruction || '你是多比，一个友好、有耐心的小学学习助手。用简单易懂的语言回答，适当使用emoji。' },
        ...processedMessages
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    };

    const apiEndpoint = baseUrl + '/chat/completions';

    if (tools && tools.length > 0) {
      requestBody.tools = tools;
    }

    logError('Chat API request - model:', requestBody.model);
    logError('Chat API request - hasImages:', requestBody.messages.some(m => Array.isArray(m.content) && m.content.some(c => c.type === 'image')));
    logError('Chat API request body:', JSON.stringify(requestBody).substring(0, 500));

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
      logError('Chat API error - Status:', response.status, response.statusText);
      logError('Chat API error - Response:', errorText);
      
      try {
        const apiError = JSON.parse(errorText) as ChatApiError;
        if (apiError.error && apiError.error.code === 'invalid_api_key') {
          return NextResponse.json(
            { error: 'API 密钥无效，请联系管理员' },
            { status: 401 }
          );
        }
        throw new Error(apiError.error?.message || apiError.message || 'API 请求失败');
      } catch (e: unknown) {
        const err = e as Error;
        throw new Error(err.message || `API 错误: ${response.status}`);
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
  } catch (err: unknown) {
    logError('Chat API error:', getErrorMessage(err));
    return NextResponse.json(
      { error: getErrorMessage(err) || '魔法出错了，请稍后再试' },
      { status: 500 }
    );
  }
}
