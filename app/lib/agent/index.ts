/**
 * Agent 编排器
 * 
 * 核心：接收用户消息 → 安全检查 → 意图识别 → 工具调度 → 生成回复
 * v2.0 新增
 */

import type { AgentConfig, AgentResponse, IntentType, PanelAction, KnowledgeSearchResult } from './types';
import { SYSTEM_PROMPT, SAFETY_PROMPT } from './system-prompt';
import { recognizeIntent, checkSafety } from './intent-router';
import { getToolsForIntent } from './tools';
import { searchKnowledge } from '../knowledge';

/**
 * Agent 主入口
 * 
 * @param userMessage 用户输入消息
 * @param history 对话历史
 * @param config Agent 配置
 * @param userId 用户ID（用于工具调用）
 * @returns Agent 响应
 */
export async function processMessage(
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  config: AgentConfig,
  userId: string
): Promise<AgentResponse> {
  // ===== Step 1: 安全检查 =====
  const safetyCheck = checkSafety(userMessage);
  if (!safetyCheck.passed) {
    return {
      text: safetyCheck.reason || '这个话题我们换个聊聊吧～不如跟我说说你今天在学校学到了什么有趣的东西？',
      intent: 'safety_violation',
      toolsUsed: [],
      safetyBlocked: true,
      safetyReason: safetyCheck.reason,
    };
  }

  // ===== Step 2: 意图识别 =====
  const intent = await recognizeIntent(
    userMessage,
    config.apiKey,
    config.baseUrl
  );

  // ===== Step 3: 知识库检索（如果是学科问答） =====
  let knowledgeContext = '';
  let knowledgeRefs: string[] = [];
  const toolsUsed: string[] = [];

  if (intent === 'subject_question' || intent === 'homework_help') {
    try {
      const results: KnowledgeSearchResult[] = await searchKnowledge({
        query: userMessage,
        topK: 5,
      });
      if (results.length > 0) {
        knowledgeContext = '\n\n【参考资料】\n' + results.map((r, i) =>
          `${i + 1}. 【${r.category}】${r.title}\n${r.content.substring(0, 500)}`
        ).join('\n\n');
        knowledgeRefs = results.map(r => r.id);
        toolsUsed.push('search_knowledge');
      }
    } catch {
      // 检索失败不影响主流程
    }
  }

  // ===== Step 4: 构建完整 Prompt =====
  let systemPrompt = SYSTEM_PROMPT;

  // 注入知识上下文
  if (knowledgeContext) {
    systemPrompt += `\n\n以下是与用户问题相关的参考资料，请根据这些资料回答问题：\n${knowledgeContext}`;
  }

  // 构建消息列表
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10),  // 最多保留最近10条历史
    { role: 'user' as const, content: userMessage },
  ];

  // ===== Step 5: 调用 LLM =====
  const response = await callLLM(messages, config, intent);

  // ===== Step 6: 解析面板指令 =====
  let panelAction: PanelAction | undefined;
  const panelMatch = response.text.match(/\[PANEL:(\w+)\|(.+?)\]/);

  if (panelMatch) {
    const panelType = panelMatch[1] as PanelAction['type'];
    try {
      const panelData = JSON.parse(panelMatch[2]);
      panelAction = {
        type: panelType,
        title: panelData.title,
        data: panelData.data,
        open: true,
      };
    } catch {
      panelAction = { type: panelType as PanelAction['type'], open: true };
    }
    // 从回复中移除面板标记
    response.text = response.text.replace(/\[PANEL:\w+\|.+?\]/, '').trim();
  }

  // 如果没有自动识别面板，根据意图推断
  if (!panelAction) {
    panelAction = inferPanelAction(intent, knowledgeRefs);
  }

  // ===== Step 7: 回复内容安全检查 =====
  const replySafety = checkSafety(response.text);
  if (!replySafety.passed) {
    response.text = replySafety.reason || '让我想想怎么回答你更好～';
  }

  // ===== Step 8: 返回结果 =====
  return {
    text: response.text,
    intent,
    toolsUsed,
    panelAction,
    safetyBlocked: false,
    knowledgeRefs,
  };
}

/**
 * 调用 LLM
 */
async function callLLM(
  messages: Array<{ role: string; content: string }>,
  config: AgentConfig,
  intent: IntentType
): Promise<{ text: string }> {
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: false,  // Agent 编排层用非流式，前端可以用 SSE
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
      signal: AbortSignal.timeout(config.stream ? 120000 : 60000),
    });

    if (!response.ok) {
      throw new Error(`LLM API 错误: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '多比暂时想不到怎么回答，换个问题试试？';

    return { text };
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误';
    return { text: `魔法出了点小问题⚡ 请稍后再试试。（${msg}）` };
  }
}

/**
 * 根据意图推断面板操作
 */
function inferPanelAction(intent: IntentType, knowledgeRefs: string[]): PanelAction | undefined {
  switch (intent) {
    case 'subject_question':
      return knowledgeRefs.length > 0
        ? { type: 'knowledge_card', title: '相关知识', open: true }
        : undefined;
    case 'schedule_query':
      return { type: 'schedule', title: '课程表', open: true };
    case 'homework_help':
      return { type: 'homework', title: '作业', open: true };
    case 'exercise_generate':
      return { type: 'exercise', title: '练习题', open: true };
    case 'growth_tree':
      return { type: 'growth_tree', title: '成长之树', open: true };
    case 'parent_score':
      return { type: 'parent_score', title: '亲子打分', open: true };
    default:
      return undefined;
  }
}

/**
 * 流式处理（SSE 模式）
 * 
 * 返回 ReadableStream，逐 chunk 转发给前端
 */
export async function processMessageStream(
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  config: AgentConfig,
  userId: string
): Promise<ReadableStream> {
  // 安全检查（同步）
  const safetyCheck = checkSafety(userMessage);
  if (!safetyCheck.passed) {
    const safeText = safetyCheck.reason || '这个话题我们换个聊聊吧～';
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(safeText));
        controller.close();
      },
    });
  }

  // 意图识别
  const intent = await recognizeIntent(userMessage, config.apiKey, config.baseUrl);

  // 知识库检索
  let knowledgeContext = '';
  if (intent === 'subject_question' || intent === 'homework_help') {
    try {
      const results = await searchKnowledge({ query: userMessage, topK: 5 });
      if (results.length > 0) {
        knowledgeContext = '\n\n【参考资料】\n' + results.map((r, i) =>
          `${i + 1}. 【${r.category}】${r.title}\n${r.content.substring(0, 500)}`
        ).join('\n\n');
      }
    } catch { /* ignore */ }
  }

  // 构建 Prompt
  let systemPrompt = SYSTEM_PROMPT;
  if (knowledgeContext) {
    systemPrompt += `\n\n以下是与用户问题相关的参考资料：\n${knowledgeContext}`;
  }

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10),
    { role: 'user' as const, content: userMessage },
  ];

  // 流式调用 LLM
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: true,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok || !response.body) {
      throw new Error(`LLM API 错误: ${response.status}`);
    }

    // 直接转发 LLM 的流式响应
    return response.body;
  } catch {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('魔法出了点小问题⚡ 请稍后再试试。')
        );
        controller.close();
      },
    });
  }
}
