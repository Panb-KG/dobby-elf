/**
 * 会话管理 API
 * 
 * GET    /api/conversations          - 获取会话列表
 * POST   /api/conversations          - 创建新会话
 * PUT    /api/conversations          - 更新会话（标题等）
 * DELETE /api/conversations          - 删除会话
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET: 获取会话列表
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  const { data, error } = await client
    .from('conversations')
    .select('id, user_id, title, model, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Conversations] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 为每个会话附加最后一条消息预览
  const conversations = await Promise.all(
    (data || []).map(async (conv) => {
      const { data: lastMsg } = await client
        .from('messages')
        .select('content, role')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...conv,
        lastMessage: lastMsg?.role === 'user' ? lastMsg.content : null,
      };
    })
  );

  return NextResponse.json({ conversations });
}

// POST: 创建新会话
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const body = await req.json();
    const { title } = body;

    const { data, error } = await client
      .from('conversations')
      .insert({
        user_id: user.id,
        title: title || '新对话',
      })
      .select()
      .single();

    if (error) {
      console.error('[Conversations] POST error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation: data }, { status: 201 });
  } catch (err) {
    console.error('[Conversations] POST exception:', err);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// PUT: 更新会话
export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const body = await req.json();
    const { id, title } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少 id' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;

    const { data, error } = await client
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[Conversations] PUT error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation: data });
  } catch (err) {
    console.error('[Conversations] PUT exception:', err);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// DELETE: 删除会话
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
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[Conversations] DELETE error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
