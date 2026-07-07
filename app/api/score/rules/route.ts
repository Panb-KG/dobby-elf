/**
 * 打分规则 API
 * 
 * GET    /api/score/rules      - 获取规则列表
 * POST   /api/score/rules      - 添加规则
 * DELETE /api/score/rules/:id  - 删除规则
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { getScoreRules, addScoreRule, deleteScoreRule, ensureScoreTables } from '@/lib/growth';
import { PRESET_RULES } from '@/lib/growth/constants';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    await ensureScoreTables();
    const rules = await getScoreRules(user.id);
    return NextResponse.json({ rules, presets: PRESET_RULES });
  } catch (error) {
    console.error('[Score Rules] 错误:', error);
    return NextResponse.json({ error: '获取打分规则失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  await ensureScoreTables();
  const body = await req.json();
  const { title, description, maxPoints, icon, category } = body;

  if (!title || !maxPoints) {
    return NextResponse.json(
      { error: 'title 和 maxPoints 不能为空' },
      { status: 400 }
    );
  }

  try {
    const rule = await addScoreRule(user.id, title, description || '', maxPoints, icon || '⭐', category || 'other');
    return NextResponse.json({ rule });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '添加失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id 参数不能为空' }, { status: 400 });
  }

  try {
    const deleted = await deleteScoreRule(id, user.id);
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error('[Score Rules DELETE] 错误:', error);
    return NextResponse.json({ error: '删除规则失败' }, { status: 500 });
  }
}
