/**
 * 日记日期列表 API
 * GET /api/diary/dates?limit=30
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { getDiaryDates } from '@/lib/diary';

export async function GET(req: NextRequest) {
  ensureV2Schema();
  const user = requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '30');

  const dates = getDiaryDates(user.id, limit);
  return NextResponse.json({ dates });
}
