/**
 * 记忆系统 API
 * 
 * GET    /api/memories          - 获取记忆列表（可按分类/标签过滤）
 * POST   /api/memories          - 创建记忆（AI 提取后调用）
 * PUT    /api/memories          - 更新记忆（激活/停用、修改内容等）
 * DELETE /api/memories          - 删除记忆
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';
import type { MemoryCategory } from '@/types';

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET: 获取记忆列表
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const tags = searchParams.get('tags'); // 逗号分隔
  const limit = parseInt(searchParams.get('limit') || '100');

  let query = client
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (tags) {
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tagArray.length > 0) {
      query = query.contains('tags', tagArray);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Memories] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ memories: data || [] });
}

// POST: 创建记忆
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const body = await req.json();
    const { content, category, source_conversation_id, source_message_id, confidence, tags } = body;

    if (!content || !category) {
      return NextResponse.json({ error: '内容和分类不能为空' }, { status: 400 });
    }

    const { data, error } = await client
      .from('memories')
      .insert({
        user_id: user.id,
        content,
        category,
        source_conversation_id: source_conversation_id || null,
        source_message_id: source_message_id || null,
        confidence: confidence ?? 1.0,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('[Memories] POST error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: data }, { status: 201 });
  } catch (err) {
    console.error('[Memories] POST exception:', err);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// PUT: 更新记忆
export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少 id' }, { status: 400 });
    }

    const allowedFields = ['content', 'category', 'confidence', 'tags', 'is_active'];
    const cleanUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        cleanUpdates[key] = updates[key];
      }
    }
    cleanUpdates.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from('memories')
      .update(cleanUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[Memories] PUT error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: data });
  } catch (err) {
    console.error('[Memories] PUT exception:', err);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// DELETE: 删除记忆
export async function DELETE(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少 id' }, { status: 400 });
  }

  const { error } = await client
    .from('memories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[Memories] DELETE error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
