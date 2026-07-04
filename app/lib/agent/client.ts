/**
 * Agent API 前端客户端
 * 
 * 调用后端 Agent 编排层
 * v2.0 新增
 */

import type { IntentType, PanelAction } from '@/lib/agent/types';
import { authFetch } from '@/lib/api-client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model' | 'system';
  content?: string;
  text?: string;
}

export interface AgentChatResponse {
  text: string;
  intent: IntentType;
  toolsUsed: string[];
  panelAction?: PanelAction;
  knowledgeRefs?: string[];
  blocked?: boolean;
  reason?: string;
}

/**
 * 调用 Agent 聊天 API（非流式）
 */
export async function agentChat(
  messages: ChatMessage[]
): Promise<AgentChatResponse> {
  const response = await authFetch('/api/chat/agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * 调用 Agent 聊天 API（流式 SSE）
 */
export async function agentChatStream(
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<AbortController> {
  const controller = new AbortController();
  const historyStr = encodeURIComponent(JSON.stringify(history));
  const msgStr = encodeURIComponent(message);

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dobi_auth_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(
      `/api/chat/agent?message=${msgStr}&history=${historyStr}`,
      { signal: controller.signal, headers }
    );

    if (!response.ok) {
      onError(`HTTP ${response.status}`);
      return controller;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('无法读取响应流');
      return controller;
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(fullText);
    }

    onComplete();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      // 用户主动取消，不报错
    } else {
      onError(error instanceof Error ? error.message : '未知错误');
    }
  }

  return controller;
}

/**
 * 调用知识库搜索
 */
export async function searchKnowledge(
  query: string,
  options?: { topK?: number; category?: string; grade?: number }
): Promise<{ results: any[]; total: number }> {
  const params = new URLSearchParams({ q: query });
  if (options?.topK) params.set('topK', String(options.topK));
  if (options?.category) params.set('category', options.category);
  if (options?.grade) params.set('grade', String(options.grade));

  const response = await authFetch(`/api/knowledge?${params}`);
  if (!response.ok) throw new Error('搜索失败');
  return response.json();
}

/**
 * 上传知识到知识库
 */
export async function uploadKnowledge(data: {
  title: string;
  source?: string;
  category: string;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; totalChunks: number }> {
  const response = await authFetch('/api/knowledge/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '上传失败' }));
    throw new Error(error.error || '上传失败');
  }
  return response.json();
}

/**
 * 获取成长之树状态
 */
export async function getGrowthTree(): Promise<{ tree: any }> {
  const response = await authFetch('/api/growth/tree');
  if (!response.ok) throw new Error('获取失败');
  return response.json();
}

/**
 * 浇水
 */
export async function waterTree(): Promise<{ watered: boolean; tree: any; message: string }> {
  const response = await authFetch('/api/growth/water', { method: 'POST' });
  if (!response.ok) throw new Error('浇水失败');
  return response.json();
}

/**
 * 获取打分规则
 */
export async function getScoreRules(): Promise<{ rules: any[]; presets: any[] }> {
  const response = await authFetch('/api/score/rules');
  if (!response.ok) throw new Error('获取规则失败');
  return response.json();
}

/**
 * 添加打分规则
 */
export async function addScoreRule(data: {
  title: string;
  description?: string;
  maxPoints: number;
  icon?: string;
  category?: string;
}): Promise<{ rule: any }> {
  const response = await authFetch('/api/score/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('添加失败');
  return response.json();
}

/**
 * 记录每日打分
 */
export async function recordDailyScore(data: {
  ruleId: string;
  score: number;
  comment?: string;
  scoredBy?: string;
  date?: string;
}): Promise<{ record: any }> {
  const response = await authFetch('/api/score/daily', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '打分失败' }));
    throw new Error(error.error || '打分失败');
  }
  return response.json();
}

/**
 * 获取今日打分
 */
export async function getTodayScores(date?: string): Promise<{ records: any[]; total: any }> {
  const params = date ? `?date=${date}` : '';
  const response = await authFetch(`/api/score/daily${params}`);
  if (!response.ok) throw new Error('获取失败');
  return response.json();
}

/**
 * 获取成长积分记录
 */
export async function getPointRecords(limit = 20): Promise<{ records: any[]; total: number }> {
  const response = await authFetch(`/api/growth/records?limit=${limit}`);
  if (!response.ok) throw new Error('获取失败');
  return response.json();
}

// ===== 魔法日记 =====

export async function getDiaryEntries(date: string): Promise<{ entries: any[]; date: string; total: number }> {
  const response = await authFetch(`/api/diary/entries?date=${date}`);
  if (!response.ok) throw new Error('获取失败');
  return response.json();
}

export async function createDiaryEntry(data: {
  date: string;
  title?: string;
  content: string;
  mood?: string;
  weather?: string;
  isVoice?: boolean;
  voiceDuration?: number;
  audioUrl?: string; // 语音录音 URL
  images?: string[];
}): Promise<{ entry: any }> {
  const response = await authFetch('/api/diary/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '创建失败' }));
    throw new Error(error.error || '创建失败');
  }
  return response.json();
}

export async function updateDiaryEntry(id: string, data: {
  title?: string;
  content?: string;
  mood?: string;
  weather?: string;
  audioUrl?: string; // 语音录音 URL
  images?: string[];
}): Promise<{ success: boolean }> {
  const response = await authFetch(`/api/diary/entries?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('更新失败');
  return response.json();
}

export async function deleteDiaryEntry(id: string): Promise<{ success: boolean }> {
  const response = await authFetch(`/api/diary/entries?id=${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('删除失败');
  return response.json();
}

export async function getDiaryDates(limit = 30): Promise<{ dates: any[] }> {
  const response = await authFetch(`/api/diary/dates?limit=${limit}`);
  if (!response.ok) throw new Error('获取失败');
  return response.json();
}

export async function searchDiary(q: string): Promise<{ entries: any[]; total: number }> {
  const response = await authFetch(`/api/diary/search?q=${encodeURIComponent(q)}`);
  if (!response.ok) throw new Error('搜索失败');
  return response.json();
}
