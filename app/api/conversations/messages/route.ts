/**
 * 会话消息 API
 * 
 * GET    /api/conversations/messages?conversation_id=xxx  - 获取会话消息列表
 * POST   /api/conversations/messages                      - 保存消息（批量）
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

// GET: 获取会话的消息列表
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversation_id');

  if (!conversationId) {
    return NextResponse.json({ error: '缺少 conversation_id' }, { status: 400 });
  }

  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Messages] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data || [] });
}

// POST: 批量保存消息
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const body = await req.json();
    const { conversation_id, messages } = body;

    if (!conversation_id || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    // 验证会话属于当前用户
    const { data: conv } = await client
      .from('conversations')
      .select('id')
      .eq('id', conversation_id)
      .eq('user_id', user.id)
      .single();

    if (!conv) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    // 批量插入消息
    const rows = messages.map((m: { role: string; content: string }) => ({
      conversation_id,
      user_id: user.id,
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content || '',
    }));

    const { error } = await client
      .from('messages')
      .insert(rows);

    if (error) {
      console.error('[Messages] POST error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 更新会话的 updated_at（触发器会自动处理）
    // 如果会话标题还是"新对话"，用第一条用户消息作为标题
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      const { data: convData } = await client
        .from('conversations')
        .select('title')
        .eq('id', conversation_id)
        .single();

      if (convData?.title === '新对话') {
        const newTitle = firstUserMsg.content.slice(0, 30);
        await client
          .from('conversations')
          .update({ title: newTitle })
          .eq('id', conversation_id)
          .eq('user_id', user.id);
      }
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err) {
    console.error('[Messages] POST exception:', err);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
