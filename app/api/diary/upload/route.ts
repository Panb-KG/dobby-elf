/**
 * 日记图片上传 API（服务端，使用 Service Role Key 绕过 Storage Policy）
 *
 * POST /api/diary/upload
 * Body: multipart/form-data with field "images" (max 5 files)
 * Returns: { urls: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'diary-images';
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

function getSupabaseStorage(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase 环境变量未配置');
  }
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files.length) {
      return NextResponse.json({ error: '没有上传图片' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `最多上传 ${MAX_FILES} 张图片` }, { status: 400 });
    }

    const supabase = getSupabaseStorage();
    const urls: string[] = [];

    for (const file of files) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: '只支持图片文件' }, { status: 400 });
      }
      // 验证文件大小
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `图片大小不能超过 ${MAX_SIZE_MB}MB` }, { status: 400 });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${timestamp}_${randomStr}.${ext}`;

      // 读取文件内容
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 用 Service Role Key 上传（绕过 Storage Policy）
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('[Diary Upload] Storage 上传失败:', error);
        return NextResponse.json({ error: `图片上传失败: ${error.message}` }, { status: 500 });
      }

      // 获取公开 URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('[Diary Upload] 错误:', err);
    const msg = err instanceof Error ? err.message : '上传失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
