/**
 * 知识库上传 API
 * 
 * POST /api/knowledge/upload
 * 
 * 请求体：
 * {
 *   "title": "章节标题",
 *   "source": "文件名",
 *   "category": "数学",
 *   "content": "文本内容",
 *   "metadata": { "grade": 3, "chapter": "第一章", "type": "textbook" }
 * }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { chunkText, embedAndStore } from '@/lib/knowledge';
import type { KnowledgeItem } from '@/lib/knowledge';
import { getErrorMessage } from '@/lib/error-helper';

export async function POST(req: NextRequest) {
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { title, source, category, content, metadata } = body;

    if (!content || !title || !category) {
      return NextResponse.json(
        { error: 'title、category、content 不能为空' },
        { status: 400 }
      );
    }

    // Step 1: 文本分块
    const chunks = chunkText(content, {
      maxChunkSize: 800,
      overlapSize: 100,
      splitBy: 'paragraph',
    });

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: '内容为空，无法上传' },
        { status: 400 }
      );
    }

    // Step 2: 构建知识条目
    const items: KnowledgeItem[] = chunks.map((chunk, i) => ({
      id: `kb_${Date.now()}_${i}`,
      userId: user.id,
      source: source || title,
      category,
      title: chunks.length > 1 ? `${title}（${i + 1}/${chunks.length}）` : title,
      content: chunk,
      metadata: metadata || {
        grade: 1,
        chapter: title,
        type: 'textbook' as const,
      },
      createdAt: new Date().toISOString(),
    }));

    // Step 3: 向量化 + 存储
    await embedAndStore(items);

    return NextResponse.json({
      success: true,
      totalChunks: items.length,
      title,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) || '上传失败' },
      { status: 500 }
    );
  }
}
