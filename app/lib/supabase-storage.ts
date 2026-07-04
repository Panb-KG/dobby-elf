/**
 * Supabase 图片上传工具
 * 
 * 提供图片上传到 Supabase Storage 的功能
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase 环境变量未配置');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

const BUCKET_NAME = 'diary-images';

/**
 * 上传图片到 Supabase Storage
 * @param file - 图片文件对象
 * @param userId - 用户 ID（用于文件夹隔离）
 * @returns 图片 URL
 */
export async function uploadImage(
  file: File,
  userId: string
): Promise<string> {
  // 生成唯一文件名
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/${timestamp}_${randomStr}.${ext}`;

  // 上传文件
  const { data, error } = await getSupabase().storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('图片上传失败:', error);
    throw new Error(error.message || '上传失败');
  }

  // 获取公开访问 URL
  const { data: urlData } = getSupabase().storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * 批量上传图片
 * @param files - 图片文件数组
 * @param userId - 用户 ID
 * @returns 图片 URL 数组
 */
export async function uploadMultipleImages(
  files: File[],
  userId: string
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, userId));
  return Promise.all(uploadPromises);
}

/**
 * 删除图片
 * @param imageUrl - 图片 URL
 * @returns 是否成功
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // 从 URL 提取文件路径
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];
    const path = `${userId}/${fileName}`;

    const { error } = await getSupabase().storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('图片删除失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('解析图片 URL 失败:', error);
    return false;
  }
}

/**
 * 验证图片文件
 * @param file - 图片文件
 * @param maxSizeMB - 最大文件大小（MB），默认 10MB
 * @returns 是否有效
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '请选择图片文件' };
  }

  // 检查文件大小
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `图片大小不能超过 ${maxSizeMB}MB` };
  }

  return { valid: true };
}
