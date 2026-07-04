/**
 * 知识库 API
 * 
 * GET  /api/knowledge      - 搜索知识
 * POST /api/knowledge/upload - 上传知识文件
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { searchKnowledge } from '@/lib/knowledge';
import { getErrorMessage } from '@/lib/error-helper';

export async function GET(req: NextRequest) {
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const topK = parseInt(searchParams.get('topK') || '3');
  const category = searchParams.get('category') || undefined;
  const grade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined;

  if (!query) {
    return NextResponse.json({ error: 'q 参数不能为空' }, { status: 400 });
  }

  try {
    const results = await searchKnowledge({
      query,
      topK,
      category,
      grade,
      userId: user.id,
    });

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) || '搜索失败' },
      { status: 500 }
    );
  }
}
