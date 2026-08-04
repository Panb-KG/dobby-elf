/**
 * 星光档案 API
 * 
 * GET    /api/portfolio          - 获取档案列表
 * POST   /api/portfolio          - 创建档案项
 * PUT    /api/portfolio          - 更新档案项
 * DELETE /api/portfolio          - 删除档案项
 * POST   /api/portfolio/upload   - 上传文件（FormData）
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

// GET: 获取档案列表
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = client
    .from('portfolio_items')
    .select('*')
    .eq('user_id', user.id)
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Portfolio] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 为图片类文件生成签名 URL
  const items = await Promise.all(
    (data || []).map(async (item) => {
      if (item.storage_path && item.file_type?.startsWith('image/')) {
        const { data: urlData } = await client.storage
          .from('portfolio')
          .createSignedUrl(item.storage_path, 3600);
        return { ...item, fileUrl: urlData?.signedUrl || null };
      }
      return { ...item, fileUrl: null };
    })
  );

  return NextResponse.json({ items });
}

// POST: 创建档案项
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const body = await req.json();
    const { title, category, description, event_date, source, tags } = body;

    if (!title || !category) {
      return NextResponse.json({ error: '标题和分类不能为空' }, { status: 400 });
    }

    const { data, error } = await client
      .from('portfolio_items')
      .insert({
        user_id: user.id,
        title,
        category,
        description: description || null,
        event_date: event_date || null,
        source: source || null,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('[Portfolio] POST error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    console.error('[Portfolio] POST exception:', err);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// PUT: 更新档案项
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

    // 只允许更新特定字段
    const allowedFields = ['title', 'category', 'description', 'event_date', 'source', 'tags', 'is_favorite', 'sort_order'];
    const cleanUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        cleanUpdates[key] = updates[key];
      }
    }
    cleanUpdates.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from('portfolio_items')
      .update(cleanUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[Portfolio] PUT error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (err) {
    console.error('[Portfolio] PUT exception:', err);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// DELETE: 删除档案项
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

  // 先获取文件路径以便删除 Storage 文件
  const { data: item } = await client
    .from('portfolio_items')
    .select('storage_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  // 删除数据库记录
  const { error } = await client
    .from('portfolio_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[Portfolio] DELETE error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 异步删除 Storage 文件（不阻塞响应）
  if (item?.storage_path) {
    client.storage.from('portfolio').remove([item.storage_path]).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
