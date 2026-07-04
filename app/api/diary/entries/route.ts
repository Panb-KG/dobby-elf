/**
 * 日记条目 API
 *
 * GET    /api/diary/entries?date=YYYY-MM-DD  - 获取某日日记
 * POST   /api/diary/entries                   - 创建日记
 * PUT    /api/diary/entries?id=xxx            - 更新日记
 * DELETE /api/diary/entries?id=xxx            - 删除日记
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { ensureV2Schema } from '@/lib/db-migration-v2';
import {
  getDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '@/lib/diary';
import { addGrowthPoints } from '@/lib/growth';

export async function GET(req: NextRequest) {
  ensureV2Schema();
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    const entries = await getDiaryEntries(user.id, date);
    return NextResponse.json({ entries: entries || [], date, total: (entries || []).length });
  } catch (error) {
    console.error('[Diary Entries] 错误:', error);
    return NextResponse.json({ entries: [], date, total: 0 });
  }
}

export async function POST(req: NextRequest) {
  ensureV2Schema();
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const { date, title, content, mood, weather, isVoice, voiceDuration, audioUrl, images } = body;

  if (!date || !content) {
    return NextResponse.json(
      { error: 'date 和 content 不能为空' },
      { status: 400 }
    );
  }

  try {
    const entry = await createDiaryEntry(user.id, date, title || '无标题', content, {
      mood,
      weather,
      isVoice,
      voiceDuration,
      audioUrl,
      images,
    });

    // 写日记奖励积分
    addGrowthPoints(user.id, 5, '写了一篇魔法日记 📝', 'diary');

    return NextResponse.json({ entry });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '创建失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  ensureV2Schema();
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id 参数不能为空' }, { status: 400 });
  }

  const body = await req.json();
  const { title, content, mood, weather, audioUrl, images } = body;

  const updated = await updateDiaryEntry(id, user.id, {
    title,
    content,
    mood,
    weather,
    audioUrl,
    images,
  });

  if (!updated) {
    return NextResponse.json({ error: '更新失败，日记不存在或无权限' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
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

  const deleted = await deleteDiaryEntry(id, user.id);

  if (!deleted) {
    return NextResponse.json({ error: '删除失败，日记不存在或无权限' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
