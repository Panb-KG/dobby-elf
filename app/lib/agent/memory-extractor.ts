/**
 * 记忆提取服务
 * 
 * 从对话中提取关键信息并存储为长期记忆
 */

import { createClient } from '@supabase/supabase-js';
import type { MemoryCategory } from '@/types';

interface ExtractedMemory {
  content: string;
  category: MemoryCategory;
  confidence: number;
  tags: string[];
}

interface MemoryExtractionResult {
  memories: ExtractedMemory[];
}

const MEMORY_EXTRACTION_PROMPT = `你是一个记忆提取助手。请从以下对话中提取对用户重要的信息，用于构建用户的长期记忆。

提取规则：
1. **用户画像** (user_profile)：年龄、年级、姓名、学校、兴趣爱好等基本信息
2. **学习偏好** (learning_pref)：喜欢的学科、学习方式、擅长/薄弱的知识点
3. **重要事件** (important_event)：比赛、考试、活动、旅行、成就等
4. **对话习惯** (conversation_habit)：常用语气、偏好的话题、互动风格
5. **其他** (general)：无法归类但可能有用的信息

输出格式（JSON）：
{
  "memories": [
    {
      "content": "记忆内容，简洁明了",
      "category": "user_profile|learning_pref|important_event|conversation_habit|general",
      "confidence": 0.8,
      "tags": ["标签1", "标签2"]
    }
  ]
}

只返回 JSON，不要其他文字。如果没有值得记忆的内容，返回 {"memories": []}。`;

export async function extractMemoriesFromConversation(
  messages: Array<{ role: string; content: string }>,
  userId: string,
  conversationId?: string
): Promise<MemoryExtractionResult> {
  const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || '';

  if (!apiKey) {
    console.warn('[Memory Extraction] API key not configured');
    return { memories: [] };
  }

  // 构建对话文本
  const conversationText = messages
    .map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
    .join('\n');

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AGENT_MODEL || 'qwen3.6-flash',
        messages: [
          { role: 'system', content: MEMORY_EXTRACTION_PROMPT },
          { role: 'user', content: `请从以下对话中提取记忆：\n\n${conversationText}` },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('[Memory Extraction] LLM error:', await response.text());
      return { memories: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    // 解析 JSON
    let result: MemoryExtractionResult;
    try {
      result = JSON.parse(content);
    } catch {
      console.error('[Memory Extraction] Invalid JSON:', content);
      return { memories: [] };
    }

    // 保存到数据库
    if (result.memories.length > 0) {
      await saveMemoriesToDatabase(result.memories, userId, conversationId);
    }

    return result;
  } catch (err) {
    console.error('[Memory Extraction] Exception:', err);
    return { memories: [] };
  }
}

async function saveMemoriesToDatabase(
  memories: ExtractedMemory[],
  userId: string,
  conversationId?: string
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('[Memory Save] Supabase not configured');
    return;
  }

  const client = createClient(url, key);

  for (const mem of memories) {
    try {
      await client.from('memories').insert({
        user_id: userId,
        content: mem.content,
        category: mem.category,
        source_conversation_id: conversationId || null,
        confidence: mem.confidence,
        tags: mem.tags,
      });
    } catch (err) {
      console.error('[Memory Save] Failed to save memory:', err);
    }
  }
}

/**
 * 检索相关记忆（用于注入到 system prompt）
 */
export async function retrieveRelevantMemories(
  userId: string,
  query: string,
  categories?: MemoryCategory[]
): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return [];

  const client = createClient(url, key);

  let dbQuery = client
    .from('memories')
    .select('content')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (categories && categories.length > 0) {
    dbQuery = dbQuery.in('category', categories);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('[Memory Retrieve] Error:', error.message);
    return [];
  }

  // 简单关键词匹配过滤
  const queryLower = query.toLowerCase();
  return (data || [])
    .filter(m => m.content.toLowerCase().includes(queryLower))
    .slice(0, 5)
    .map(m => m.content);
}
