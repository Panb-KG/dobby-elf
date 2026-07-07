/**
 * Supabase 日记数据访问层
 * 
 * 提供日记的 CRUD 操作，支持原始输入和 AI 整理后的日记
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { DiaryRaw, DiaryProcessed } from './supabase-diary-types';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 环境变量未配置：需要 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY（或 NEXT_PUBLIC_SUPABASE_ANON_KEY）');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

// ===== 原始输入操作 =====

/**
 * 保存原始输入（语音转文字、图片等）
 */
export async function saveDiaryRaw(
  userId: string,
  inputType: 'voice' | 'text' | 'image',
  rawContent: string,
  options: { imageUrls?: string[]; metadata?: any } = {}
): Promise<DiaryRaw> {
  const { data, error } = await getSupabase()
    .from('diary_raw')
    .insert({
      user_id: userId,
      input_type: inputType,
      raw_content: rawContent,
      image_urls: options.imageUrls || [],
      metadata: options.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error('保存原始日记失败:', error);
    throw new Error(error.message || '保存失败');
  }

  return data as DiaryRaw;
}

/**
 * 按 ID 获取单条原始日记
 */
export async function getDiaryRawById(id: string, userId: string): Promise<DiaryRaw | null> {
  const { data, error } = await getSupabase()
    .from('diary_raw')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('查询原始日记失败:', error);
    return null;
  }
  return data as DiaryRaw | null;
}

/**
 * 更新原始日记
 */
export async function updateDiaryRaw(
  id: string,
  userId: string,
  updates: { rawContent?: string; imageUrls?: string[]; metadata?: any }
): Promise<boolean> {
  const updateData: any = { updated_at: new Date().toISOString() };
  if (updates.rawContent !== undefined) updateData.raw_content = updates.rawContent;
  if (updates.imageUrls !== undefined) updateData.image_urls = updates.imageUrls;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

  const { error } = await getSupabase()
    .from('diary_raw')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('更新原始日记失败:', error);
    return false;
  }
  return true;
}

/**
 * 按 ID 删除原始日记
 */
export async function deleteDiaryRawById(id: string, userId: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('diary_raw')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('删除原始日记失败:', error);
    return false;
  }
  return true;
}

/**
 * 获取用户的原始输入记录
 */
export async function getDiaryRaws(userId: string, limit = 50): Promise<DiaryRaw[]> {
  const { data, error } = await getSupabase()
    .from('diary_raw')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取原始日记失败:', error);
    return [];
  }

  return (data as DiaryRaw[]) || [];
}

// ===== 整理后日记操作 =====

/**
 * 创建或更新整理后的日记
 */
export async function upsertDiaryProcessed(
  userId: string,
  diaryDate: string,
  diary: Partial<DiaryProcessed>
): Promise<DiaryProcessed> {
  const { data, error } = await getSupabase()
    .from('diary_processed')
    .upsert({
      user_id: userId,
      diary_date: diaryDate,
      ...diary,
    }, {
      onConflict: 'user_id,diary_date',
    })
    .select()
    .single();

  if (error) {
    console.error('保存整理日记失败:', error);
    throw new Error(error.message || '保存失败');
  }

  return data as DiaryProcessed;
}

/**
 * 获取某日的整理后日记
 */
export async function getDiaryProcessed(userId: string, date: string): Promise<DiaryProcessed | null> {
  const { data, error } = await getSupabase()
    .from('diary_processed')
    .select('*')
    .eq('user_id', userId)
    .eq('diary_date', date)
    .maybeSingle();

  if (error) {
    console.error('获取整理日记失败:', error);
    return null;
  }

  return data as DiaryProcessed | null;
}

/**
 * 获取用户所有整理后的日记（按日期倒序）
 */
export async function getDiaryProcessedList(userId: string, limit = 30): Promise<DiaryProcessed[]> {
  const { data, error } = await getSupabase()
    .from('diary_processed')
    .select('*')
    .eq('user_id', userId)
    .order('diary_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取日记列表失败:', error);
    return [];
  }

  return (data as DiaryProcessed[]) || [];
}

/**
 * 删除整理后的日记
 */
export async function deleteDiaryProcessed(userId: string, diaryDate: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('diary_processed')
    .delete()
    .eq('user_id', userId)
    .eq('diary_date', diaryDate);

  if (error) {
    console.error('删除日记失败:', error);
    return false;
  }

  return true;
}

// ===== 搜索功能 =====

/**
 * 搜索日记内容
 */
export async function searchDiaries(userId: string, query: string): Promise<DiaryProcessed[]> {
  const { data, error } = await getSupabase()
    .from('diary_processed')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('diary_date', { ascending: false });

  if (error) {
    console.error('搜索日记失败:', error);
    return [];
  }

  return (data as DiaryProcessed[]) || [];
}

// 重新导出类型和转换函数
export { DiaryRaw, DiaryProcessed } from './supabase-diary-types';
export { convertRawToDiaryEntry, convertProcessedToDiaryEntry } from './supabase-diary-types';
