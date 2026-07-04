/**
 * Agent 驱动的聊天 API
 * 
 * v2.0 新增：取代原有的直接调 LLM 模式
 * 流程：用户消息 → 安全检查 → 意图识别 → 工具调度 → LLM 生成 → 安全过滤 → 返回
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { processMessage, processMessageStream } from '@/lib/agent';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { addGrowthPoints } from '@/lib/growth';
import { error as logError } from '@/lib/console';
import { getErrorMessage } from '@/lib/error-helper';

/**
 * POST /api/chat/agent
 * 
 * 非流式响应
 */
export async function POST(req: NextRequest) {
  // 确保 v2 数据库 schema 已就绪
  ensureV2Schema();

  // 鉴权
  const user = await requireAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const config = {
    model: process.env.AGENT_MODEL || process.env.DASHSCOPE_MODEL || 'qwen3.6-flash',
    baseUrl: process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL ||
      'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '',
    maxTokens: parseInt(process.env.AGENT_MAX_TOKENS || '2048'),
    temperature: parseFloat(process.env.AGENT_TEMPERATURE || '0.7'),
    stream: false,
    safetyLevel: 'strict',
  };

  if (!config.apiKey) {
    return NextResponse.json(
      { error: 'API 密钥未配置，请联系管理员' },
      { status: 500 }
    );
  }

  console.log('[Agent] 配置:', { model: config.model, baseUrl: config.baseUrl, apiKeyPrefix: config.apiKey.substring(0, 8) + '...' });

  try {
    const body = await req.json();
    const { messages, systemInstruction } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages 不能为空' },
        { status: 400 }
      );
    }

    // 最后一条是用户消息
    const userMessage = messages[messages.length - 1].content || '';
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content || m.text || '',
    }));

    // 调用 Agent 编排层
    const response = await processMessage(
      userMessage,
      history,
      config,
      user.id
    );

    // 安全拦截
    if (response.safetyBlocked) {
      return NextResponse.json({
        text: response.text,
        blocked: true,
        reason: response.safetyReason,
      });
    }

    // 发放成长积分（每次问答 +1）
    try {
      addGrowthPoints(user.id, 1, '完成一次问答 💬', 'chat');
    } catch {
      // 积分失败不影响聊天
    }

    return NextResponse.json({
      text: response.text,
      intent: response.intent,
      toolsUsed: response.toolsUsed,
      panelAction: response.panelAction,
      knowledgeRefs: response.knowledgeRefs,
    });
  } catch (error) {
    const errMsg = getErrorMessage(error);
    logError('[Agent Chat] 错误:', errMsg);
    return NextResponse.json(
      { error: `魔法出了点小问题⚡ 请稍后再试（${errMsg}）` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/agent
 * 
 * 流式响应（SSE）
 */
export async function GET(req: NextRequest) {
  // 确保 v2 数据库 schema 已就绪
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(req.url);
  const message = searchParams.get('message') || '';
  const historyParam = searchParams.get('history') || '[]';

  if (!message) {
    return NextResponse.json(
      { error: 'message 参数不能为空' },
      { status: 400 }
    );
  }

  const config = {
    model: process.env.AGENT_MODEL || process.env.DASHSCOPE_MODEL || 'qwen3.6-flash',
    baseUrl: process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL ||
      'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '',
    maxTokens: parseInt(process.env.AGENT_MAX_TOKENS || '2048'),
    temperature: parseFloat(process.env.AGENT_TEMPERATURE || '0.7'),
    stream: true,
    safetyLevel: 'strict',
  };

  try {
    const history = JSON.parse(historyParam);
    const stream = await processMessageStream(message, history, config, user.id);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    logError('[Agent Chat SSE] 错误:', getErrorMessage(error));
    return NextResponse.json(
      { error: '魔法出了点小问题⚡ 请稍后再试' },
      { status: 500 }
    );
  }
}
