/**
 * 成长之树 API
 * 
 * GET  /api/growth/tree - 获取成长之树状态
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { getGrowthTree, createGrowthTree } from '@/lib/growth';

export async function GET(req: NextRequest) {
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    let tree = getGrowthTree(user.id);
    if (!tree) {
      tree = createGrowthTree(user.id);
    }
    return NextResponse.json({ tree });
  } catch (error) {
    console.error('[Growth Tree] 错误:', error);
    return NextResponse.json({ error: '获取成长之树状态失败' }, { status: 500 });
  }
}
