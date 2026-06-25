/**
 * 知识库模块 - 向量化服务
 * 
 * 使用 DashScope text-embedding 进行向量化
 * v2.0 新增
 */

import type { KnowledgeItem } from './types';

/**
 * 文本向量化
 * 
 * @param texts 文本数组
 * @returns 向量数组
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.TOKEN_PLAN_API_KEY || '';
  const baseUrl = process.env.DASHSCOPE_BASE_URL ||
    process.env.TOKEN_PLAN_BASE_URL ||
    'https://dashscope.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    throw new Error('API Key 未配置');
  }

  // DashScope 限制：每次最多 25 条
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += 25) {
    batches.push(texts.slice(i, i + 25));
  }

  const allEmbeddings: number[][] = [];

  for (const batch of batches) {
    const response = await fetch(`${baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-v3',
        input: batch,
        dimensions: 1024,  // 可选维度
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`向量化失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const embeddings = data.data?.map((item: { embedding: number[] }) => item.embedding) || [];
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

/**
 * 单条文本向量化
 */
export async function embedText(text: string): Promise<number[]> {
  const results = await embedTexts([text]);
  return results[0];
}

/**
 * 余弦相似度
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 将知识条目向量化并存储
 */
export async function embedAndStore(items: KnowledgeItem[]): Promise<void> {
  const texts = items.map(item => `${item.title} ${item.content}`);
  const embeddings = await embedTexts(texts);

  // 将向量附加到条目上
  items.forEach((item, i) => {
    item.embedding = embeddings[i];
  });

  // 存储到数据库（通过 API）
  const { batchInsertKnowledge } = await import('./search');
  await batchInsertKnowledge(items);
}
