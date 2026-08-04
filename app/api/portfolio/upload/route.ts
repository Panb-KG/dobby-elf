/**
 * 星光档案 - 文件上传
 * 
 * POST /api/portfolio/upload - 上传文件到 Supabase Storage
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

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string || 'other';
    const title = formData.get('title') as string || '';

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    // 文件大小限制：10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过 10MB' }, { status: 400 });
    }

    // 生成存储路径
    const ext = file.name.split('.').pop() || 'file';
    const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // 上传到 Supabase Storage
    const { error: uploadError } = await client.storage
      .from('portfolio')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Portfolio Upload] Storage error:', uploadError.message);
      return NextResponse.json({ error: '上传失败: ' + uploadError.message }, { status: 500 });
    }

    // 创建档案记录
    const { data: item, error: dbError } = await client
      .from('portfolio_items')
      .insert({
        user_id: user.id,
        title: title || file.name,
        category,
        storage_path: path,
        file_type: file.type,
        event_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Portfolio Upload] DB error:', dbError.message);
      // 回滚 Storage 文件
      client.storage.from('portfolio').remove([path]).catch(() => {});
      return NextResponse.json({ error: '保存记录失败' }, { status: 500 });
    }

    // 生成签名 URL
    let fileUrl: string | null = null;
    if (file.type.startsWith('image/')) {
      const { data: urlData } = await client.storage
        .from('portfolio')
        .createSignedUrl(path, 3600);
      fileUrl = urlData?.signedUrl || null;
    }

    return NextResponse.json({ item: { ...item, fileUrl } }, { status: 201 });
  } catch (err) {
    console.error('[Portfolio Upload] Exception:', err);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
