/**
 * 每日打分记录 API
 * 
 * GET    /api/score/daily        - 获取今日打分记录
 * POST   /api/score/daily        - 记录打分
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { getTodayScores, recordDailyScore, getDailyTotal, addGrowthPoints, ensureScoreTables } from '@/lib/growth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    await ensureScoreTables();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;

    const records = await getTodayScores(user.id, date);
    const total = await getDailyTotal(user.id, date);

    return NextResponse.json({ records, total });
  } catch (error) {
    console.error('[Score Daily] 错误:', error);
    return NextResponse.json({ error: '获取打分记录失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  await ensureScoreTables();
  const body = await req.json();
  const { ruleId, score, comment, scoredBy, date } = body;

  if (!ruleId || score === undefined) {
    return NextResponse.json(
      { error: 'ruleId 和 score 不能为空' },
      { status: 400 }
    );
  }

  try {
    const record = await recordDailyScore(
      user.id,
      ruleId,
      score,
      comment || '',
      scoredBy || 'child',
      date || new Date().toISOString().split('T')[0]
    );

    // 打分计入成长积分（得分 × 2）
    try {
      await addGrowthPoints(user.id, score * 2, `亲子打分: ${comment || record.ruleTitle}`, 'parent_score');
    } catch { /* ignore */ }

    return NextResponse.json({ record });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '打分失败';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
