/**
 * 浇水 API
 * 
 * POST /api/growth/water - 浇水（+10积分）
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { waterTree, createGrowthTree } from '@/lib/growth';

export async function POST(req: NextRequest) {
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const result = waterTree(user.id);
    return NextResponse.json({
      watered: result.watered,
      tree: result.tree,
      message: result.watered ? '浇水成功！成长之树又长大了一点 🌊' : '今天已经浇过水了，明天再来吧！',
    });
  } catch (error) {
    console.error('[Growth Water] 错误:', error);
    return NextResponse.json({ error: '浇水失败，请稍后重试' }, { status: 500 });
  }
}
