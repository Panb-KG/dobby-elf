/**
 * 专注完成 API
 * 
 * POST /api/growth/focus - 完成专注后奖励积分
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { addGrowthPoints, ensureGrowthTables } from '@/lib/growth';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const { duration } = body; // 专注时长（秒）

  if (!duration || duration <= 0) {
    return NextResponse.json({ error: '无效的专注时长' }, { status: 400 });
  }

  try {
    await ensureGrowthTables();

    // 根据专注时长计算积分：每分钟1分，最少5分钟起算
    const minutes = Math.floor(duration / 60);
    if (minutes < 5) {
      return NextResponse.json({ 
        points: 0, 
        message: '专注时间不足5分钟，未获得积分' 
      });
    }

    const points = Math.min(minutes, 30); // 最多30分
    await addGrowthPoints(user.id, points, `完成${minutes}分钟专注 ⏱️`, 'focus');

    return NextResponse.json({ 
      points, 
      message: `专注${minutes}分钟，获得${points}成长积分！` 
    });
  } catch (error) {
    console.error('[Growth Focus] 错误:', error);
    return NextResponse.json({ error: '奖励积分失败' }, { status: 500 });
  }
}
