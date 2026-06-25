/**
 * 成长积分记录 API
 * 
 * GET /api/growth/records - 获取积分记录
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { getPointRecords } from '@/lib/growth';

export async function GET(req: NextRequest) {
  ensureV2Schema();

  const user = requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const records = getPointRecords(user.id, limit);

  return NextResponse.json({ records, total: records.length });
}
