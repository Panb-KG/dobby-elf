/**
 * 日记搜索 API
 * GET /api/diary/search?q=关键词
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { searchDiary } from '@/lib/diary';

export async function GET(req: NextRequest) {
  ensureV2Schema();
  const user = requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ entries: [] });
  }

  const entries = searchDiary(user.id, q.trim());
  return NextResponse.json({ entries, total: entries.length });
}
