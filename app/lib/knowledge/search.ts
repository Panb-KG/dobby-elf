/**
 * 知识库模块 - 检索服务
 * 
 * 向量相似度搜索 + 关键词匹配
 * v2.0 新增
 */

import type {
  KnowledgeSearchRequest,
  KnowledgeSearchResult,
  KnowledgeItem,
} from './types';
import { cosineSimilarity } from './embedder';

/**
 * 知识库搜索
 * 
 * @param request 搜索请求
 * @returns 搜索结果（按相关性排序）
 */
export async function searchKnowledge(
  request: KnowledgeSearchRequest
): Promise<KnowledgeSearchResult[]> {
  const { query, topK = 3, category, grade, type, userId } = request;

  if (!query.trim()) {
    return [];
  }

  try {
    // Step 1: 从数据库加载知识条目
    const items = await loadKnowledgeItems({ category, grade, type, userId });

    if (items.length === 0) {
      return [];
    }

    // Step 2: 查询向量化
    const { embedText } = await import('./embedder');
    const queryEmbedding = await embedText(query);

    // Step 3: 向量相似度计算
    const scoredItems = items
      .filter(item => item.embedding && item.embedding.length > 0)
      .map(item => ({
        item,
        score: cosineSimilarity(queryEmbedding, item.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // Step 4: 如果没有向量结果，用关键词兜底
    if (scoredItems.length === 0) {
      return keywordSearch(items, query, topK);
    }

    return scoredItems.map(({ item, score }) => ({
      id: item.id,
      source: item.source,
      category: item.category,
      title: item.title,
      content: item.content,
      score,
      metadata: item.metadata,
    }));
  } catch (error) {
    console.error('[知识库] 搜索失败:', error);
    // 兜底：关键词搜索
    try {
      const items = await loadKnowledgeItems({ category, grade, type, userId });
      return keywordSearch(items, query, topK);
    } catch {
      return [];
    }
  }
}

/**
 * 关键词搜索（向量搜索失败时的兜底方案）
 */
function keywordSearch(
  items: KnowledgeItem[],
  query: string,
  topK: number
): KnowledgeSearchResult[] {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = items.map(item => {
    const text = `${item.title} ${item.content}`.toLowerCase();
    let score = 0;

    for (const kw of keywords) {
      if (text.includes(kw)) {
        // 标题命中加分更多
        if (item.title.toLowerCase().includes(kw)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }

    return { item, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ item, score }) => ({
      id: item.id,
      source: item.source,
      category: item.category,
      title: item.title,
      content: item.content,
      score: score / keywords.length,  // 归一化
      metadata: item.metadata,
    }));
}

/**
 * 从数据库加载知识条目
 */
async function loadKnowledgeItems(filters: {
  category?: string;
  grade?: number;
  type?: string;
  userId?: string;
}): Promise<KnowledgeItem[]> {
  const { getDb } = await import('../db');
  const db = getDb();

  let sql = 'SELECT * FROM knowledge_items WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.grade) {
    sql += ' AND CAST(json_extract(metadata, "$.grade") AS INTEGER) = ?';
    params.push(filters.grade);
  }
  if (filters.type) {
    sql += ' AND json_extract(metadata, "$.type") = ?';
    params.push(filters.type);
  }
  if (filters.userId) {
    sql += ' AND user_id = ?';
    params.push(filters.userId);
  }

  sql += ' ORDER BY created_at DESC LIMIT 500';

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    source: row.source,
    category: row.category,
    title: row.title,
    content: row.content,
    embedding: row.embedding ? JSON.parse(row.embedding) : undefined,
    metadata: JSON.parse(row.metadata || '{}'),
    createdAt: row.created_at,
  }));
}

/**
 * 批量插入知识条目（供 embedder 调用）
 */
export async function batchInsertKnowledge(items: KnowledgeItem[]): Promise<void> {
  const { getDb } = await import('../db');
  const db = getDb();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO knowledge_items
    (id, user_id, source, category, title, content, embedding, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((knowledgeItems: KnowledgeItem[]) => {
    for (const item of knowledgeItems) {
      stmt.run(
        item.id,
        item.userId,
        item.source,
        item.category,
        item.title,
        item.content,
        item.embedding ? JSON.stringify(item.embedding) : null,
        JSON.stringify(item.metadata),
        item.createdAt,
      );
    }
  });

  insertMany(items);
}
