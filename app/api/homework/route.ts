import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient<any>(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const status = searchParams.get('status') || 'all';
  const subject = searchParams.get('subject');

  if (!userId) {
    // AI Agent 调用时可能没有 user_id，返回空数组而不是报错
    return NextResponse.json([]);
  }

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });

  try {
    let query = client
      .from('homework')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      // 表可能不存在，返回空数组
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json([]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: '获取作业列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, subject, title, due_date, status, image } = body;

  if (!user_id || !title) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });

  try {
    const { data, error } = await client
      .from('homework')
      .insert({
        user_id,
        subject: subject || '其他',
        title,
        due_date: due_date || null,
        status: status || 'pending',
        image: image || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: '创建作业失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少 id' }, { status: 400 });
  }

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });

  try {
    const { error } = await client.from('homework').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '删除作业失败' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;

  if (!id) {
    return NextResponse.json({ error: '缺少 id' }, { status: 400 });
  }

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });

  try {
    const { data, error } = await client
      .from('homework')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: '更新作业失败' }, { status: 500 });
  }
}
