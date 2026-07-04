/**
 * Supabase 日记数据访问层
 * 
 * 提供日记的 CRUD 操作，支持原始输入和 AI 整理后的日记
 */

import { createClient } from '@supabase/supabase-js';
import type { DiaryEntry } from './diary';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== 数据库表类型定义 =====

export interface DiaryRaw {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  input_type: 'voice' | 'text' | 'image';
  raw_content: string;
  image_urls?: string[];
  metadata?: {
    date?: string;
    location?: string;
    weather?: string;
    mood?: string;
    voice_duration?: number;
    [key: string]: any;
  };
}

export interface DiaryProcessed {
  id: string;
  user_id: string;
  diary_date: string;
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  subject_links?: string[];
  mood?: string;
  weather?: string;
  location?: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

// ===== 原始输入操作 =====

/**
 * 保存原始输入（语音转文字、图片等）
 */
export async function saveDiaryRaw(
  userId: string,
  inputType: 'voice' | 'text' | 'image',
  rawContent: string,
  options: {
    imageUrls?: string[];
    metadata?: any;
  } = {}
): Promise<DiaryRaw> {
  const { data, error } = await supabase
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
 * 获取用户的原始输入记录
 */
export async function getDiaryRaws(
  userId: string,
  limit = 50
): Promise<DiaryRaw[]> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
export async function getDiaryProcessed(
  userId: string,
  date: string
): Promise<DiaryProcessed | null> {
  const { data, error } = await supabase
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
export async function getDiaryProcessedList(
  userId: string,
  limit = 30
): Promise<DiaryProcessed[]> {
  const { data, error } = await supabase
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
export async function deleteDiaryProcessed(
  userId: string,
  diaryDate: string
): Promise<boolean> {
  const { error } = await supabase
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
export async function searchDiaries(
  userId: string,
  query: string
): Promise<DiaryProcessed[]> {
  const { data, error } = await supabase
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

// ===== 工具函数 =====

/**
 * 将原始输入转换为标准 DiaryEntry 格式（兼容旧接口）
 */
export function convertRawToDiaryEntry(raw: DiaryRaw): DiaryEntry {
  return {
    id: raw.id,
    userId: raw.user_id,
    date: raw.metadata?.date || new Date(raw.created_at).toISOString().split('T')[0],
    title: '无标题',
    content: raw.raw_content,
    mood: raw.metadata?.mood,
    weather: raw.metadata?.weather,
    isVoice: raw.input_type === 'voice',
    voiceDuration: raw.metadata?.voice_duration,
    images: raw.image_urls || [],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * 将整理后日记转换为标准 DiaryEntry 格式
 */
export function convertProcessedToDiaryEntry(processed: DiaryProcessed): DiaryEntry {
  return {
    id: processed.id,
    userId: processed.user_id,
    date: processed.diary_date,
    title: processed.title,
    content: processed.content,
    mood: processed.mood,
    weather: processed.weather,
    isVoice: false,
    images: processed.images || [],
    createdAt: processed.created_at,
    updatedAt: processed.updated_at,
  };
}
