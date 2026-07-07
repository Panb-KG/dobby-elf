/**
 * Supabase 日记类型定义和转换工具
 */

import type { DiaryEntry } from './diary';

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
    audio_url?: string;
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

/**
 * 将原始输入转换为标准 DiaryEntry 格式
 */
export function convertRawToDiaryEntry(raw: DiaryRaw): DiaryEntry {
  return {
    id: raw.id,
    userId: raw.user_id,
    date: raw.metadata?.date || new Date(raw.created_at).toISOString().split('T')[0],
    title: raw.metadata?.title || '无标题',
    content: raw.raw_content,
    mood: raw.metadata?.mood,
    weather: raw.metadata?.weather,
    isVoice: raw.input_type === 'voice',
    voiceDuration: raw.metadata?.voice_duration,
    audioUrl: raw.metadata?.audio_url,
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
