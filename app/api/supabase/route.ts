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
  const type = searchParams.get('type'); // conversations, messages, courses
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: '缺少 user_id' }, { status: 400 });
  }

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });

  try {
    switch (type) {
      case 'conversations': {
        const { data, error } = await client
          .from('conversations')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'messages': {
        const conversationId = searchParams.get('conversation_id');
        if (!conversationId) {
          return NextResponse.json({ error: '缺少 conversation_id' }, { status: 400 });
        }
        const { data, error } = await client
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'courses': {
        const { data, error } = await client
          .from('courses')
          .select('*')
          .eq('user_id', userId)
          .order('day_of_week', { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'homework': {
        const { data, error } = await client
          .from('homework')
          .select('*')
          .eq('user_id', userId)
          .order('due_date', { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'achievements': {
        const { data, error } = await client
          .from('achievements')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: '无效的类型' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type } = body;

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });

  try {
    switch (type) {
      case 'conversation': {
        const { user_id, title, model } = body;
        const { data, error } = await client
          .from('conversations')
          .insert({ user_id, title: title || '新对话', model: model || 'qwen3.6-flash' })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'message': {
        const { conversation_id, user_id, role, content, images } = body;
        const { data, error } = await client
          .from('messages')
          .insert({ conversation_id, user_id, role, content, images })
          .select()
          .single();
        if (error) throw error;

        await client
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversation_id);

        return NextResponse.json(data);
      }

      case 'course': {
        const { user_id, name, teacher, location, day_of_week, start_time, end_time, color } = body;
        const { data, error } = await client
          .from('courses')
          .insert({ user_id, name, teacher, location, day_of_week, start_time, end_time, color })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'homework': {
        const { id, user_id, subject, title, status, due_date, image } = body;
        if (id) {
          // 更新已有作业
          const { data, error } = await client
            .from('homework')
            .update({ subject, title, status, due_date, image })
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single();
          if (error) throw error;
          return NextResponse.json(data);
        }
        const { data, error } = await client
          .from('homework')
          .insert({ user_id, subject, title, status, due_date, image })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'achievement': {
        const { id, user_id, title, date, type, icon_name, color, points } = body;
        if (id) {
          const { data, error } = await client
            .from('achievements')
            .update({ title, date, type, icon_name, color, points })
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single();
          if (error) throw error;
          return NextResponse.json(data);
        }
        const { data, error } = await client
          .from('achievements')
          .insert({ user_id, title, date, type, icon_name, color, points })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: '无效的类型' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!id || !type) {
    return NextResponse.json({ error: '缺少 id 或 type' }, { status: 400 });
  }

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });

  try {
    switch (type) {
      case 'course': {
        const userId = searchParams.get('user_id');
        const query = client.from('courses').delete().eq('id', id);
        if (userId) query.eq('user_id', userId);
        const { error } = await query;
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'homework': {
        const userId = searchParams.get('user_id');
        const query = client.from('homework').delete().eq('id', id);
        if (userId) query.eq('user_id', userId);
        const { error } = await query;
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'achievement': {
        const userId = searchParams.get('user_id');
        const query = client.from('achievements').delete().eq('id', id);
        if (userId) query.eq('user_id', userId);
        const { error } = await query;
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'conversation': {
        const { error } = await client
          .from('conversations')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'message': {
        const { error } = await client
          .from('messages')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: '无效的类型' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
