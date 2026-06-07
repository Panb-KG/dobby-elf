import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Supabase 管理 API
 * 处理对话、消息、课程等数据的 CRUD
 * 
 * 路由：
 * - GET /api/supabase/conversations - 获取对话列表
 * - POST /api/supabase/conversations - 创建新对话
 * - GET /api/supabase/messages?conversation_id=xxx - 获取消息
 * - POST /api/supabase/messages - 添加消息
 * - GET /api/supabase/courses - 获取课程
 * - POST /api/supabase/courses - 添加课程
 */

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // conversations, messages, courses
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: '缺少 user_id' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'conversations': {
        const { data, error } = await supabase
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
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'courses': {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('user_id', userId)
          .order('day_of_week', { ascending: true });
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

export async function POST(request: Request) {
  const body = await request.json();
  const { type } = body;

  try {
    switch (type) {
      case 'conversation': {
        const { user_id, title, model } = body;
        const { data, error } = await supabase
          .from('conversations')
          .insert({ user_id, title: title || '新对话', model: model || 'qwen3.6-flash' })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case 'message': {
        const { conversation_id, user_id, role, content, images } = body;
        const { data, error } = await supabase
          .from('messages')
          .insert({ conversation_id, user_id, role, content, images })
          .select()
          .single();
        if (error) throw error;

        // 更新对话的 updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversation_id);

        return NextResponse.json(data);
      }

      case 'course': {
        const { user_id, name, teacher, location, day_of_week, start_time, end_time, color } = body;
        const { data, error } = await supabase
          .from('courses')
          .insert({ user_id, name, teacher, location, day_of_week, start_time, end_time, color })
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
