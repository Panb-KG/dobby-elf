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
import { ensureV2Schema } from '@/lib/db-migration-v2';
import { getScoreRules, addScoreRule, deleteScoreRule, PRESET_RULES } from '@/lib/growth';

export async function GET(req: NextRequest) {
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const rules = getScoreRules(user.id);
  return NextResponse.json({ rules, presets: PRESET_RULES });
}

export async function POST(req: NextRequest) {
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const { title, description, maxPoints, icon, category } = body;

  if (!title || !maxPoints) {
    return NextResponse.json(
      { error: 'title 和 maxPoints 不能为空' },
      { status: 400 }
    );
  }

  const rule = addScoreRule(user.id, title, description || '', maxPoints, icon || '⭐', category || 'other');

  return NextResponse.json({ rule });
}

export async function DELETE(req: NextRequest) {
  ensureV2Schema();

  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id 参数不能为空' }, { status: 400 });
  }

  const deleted = deleteScoreRule(id, user.id);

  return NextResponse.json({ deleted });
}
