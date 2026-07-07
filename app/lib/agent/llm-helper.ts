/**
 * Agent LLM 调用辅助函数
 */

import type { AgentConfig, IntentType, PanelAction } from './types';

/**
 * 调用 LLM API（非流式）
 */
export async function callLLM(
  messages: Array<{ role: string; content: string }>,
  config: AgentConfig,
  intent: IntentType
): Promise<{ text: string }> {
  const apiUrl = `${config.baseUrl}/chat/completions`;
  console.log('[LLM] 调用:', apiUrl, '模型:', config.model, '意图:', intent);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: false,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
      signal: AbortSignal.timeout(config.stream ? 120000 : 60000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[LLM] API 错误:', response.status, response.statusText, errorText.substring(0, 500));
      throw new Error(`LLM API 错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '多比暂时想不到怎么回答，换个问题试试？';

    return { text };
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误';
    console.error('[LLM] 异常:', msg);
    return { text: `魔法出了点小问题⚡ 请稍后再试试。（${msg}）` };
  }
}

/**
 * 根据意图推断面板操作
 */
export function inferPanelAction(intent: IntentType, knowledgeRefs: string[]): PanelAction | undefined {
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
