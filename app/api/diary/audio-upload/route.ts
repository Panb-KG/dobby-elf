/**
 * 日记音频上传 API（服务端，使用 Service Role Key 绕过 Storage Policy）
 *
 * POST /api/diary/audio-upload
 * Body: multipart/form-data with field "audio"
 * Returns: { url: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'diary-audio';
const MAX_SIZE_MB = 20; // 音频最大 20MB

function getSupabaseStorage(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase 环境变量未配置');
  }
  return createClient(url, key);
}

async function ensureBucket(supabase: SupabaseClient) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_SIZE_MB * 1024 * 1024,
      allowedMimeTypes: [
        'audio/webm',
        'audio/ogg',
        'audio/mp4',
        'audio/mpeg',
        'audio/wav',
        'audio/x-m4a',
      ],
    });
    if (error) {
      console.error('[Audio Upload] 创建 bucket 失败:', error);
      throw new Error(`Storage bucket 创建失败: ${error.message}`);
    }
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: '没有上传音频' }, { status: 400 });
    }

    // 验证文件大小
    if (audioFile.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `音频大小不能超过 ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const supabase = getSupabaseStorage();
    await ensureBucket(supabase);

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = audioFile.type.includes('webm') ? 'webm'
      : audioFile.type.includes('mp4') ? 'mp4'
      : audioFile.type.includes('ogg') ? 'ogg'
      : audioFile.type.includes('wav') ? 'wav'
      : 'webm';
    const fileName = `${user.id}/${timestamp}_${randomStr}.${ext}`;

    // 读取文件内容
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 用 Service Role Key 上传（绕过 Storage Policy）
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: audioFile.type || 'audio/webm',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[Audio Upload] Storage 上传失败:', error);
      return NextResponse.json({ error: `音频上传失败: ${error.message}` }, { status: 500 });
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('[Audio Upload] 错误:', err);
    const msg = err instanceof Error ? err.message : '上传失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
