/**
 * 日记模块 - Supabase 实现
 * 
 * 提供日记的 CRUD 操作，兼容旧接口
 */

import {
  saveDiaryRaw,
  getDiaryRaws,
  upsertDiaryProcessed,
  getDiaryProcessed,
  getDiaryProcessedList,
  deleteDiaryProcessed,
  searchDiaries,
  convertRawToDiaryEntry,
  convertProcessedToDiaryEntry,
} from './supabase-diary';

export interface DiaryEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  weather?: string;
  isVoice?: boolean;
  voiceDuration?: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取某日的日记列表（优先返回整理后的日记）
 */
export async function getDiaryEntries(
  userId: string,
  date: string
): Promise<DiaryEntry[]> {
  // 先尝试获取整理后的日记
  const processed = await getDiaryProcessed(userId, date);
  if (processed) {
    return [convertProcessedToDiaryEntry(processed)];
  }

  // 如果没有整理后的日记，返回原始输入
  const raws = await getDiaryRaws(userId, 10);
  const filtered = raws.filter(r => r.metadata?.date === date);
  return filtered.map(convertRawToDiaryEntry);
}

/**
 * 获取有日记的日期列表
 */
export async function getDiaryDates(
  userId: string,
  limit = 30
): Promise<{ date: string; count: number; latestTitle: string; moods: string[] }[]> {
  const diaries = await getDiaryProcessedList(userId, limit);
  
  return diaries.map(d => ({
    date: d.diary_date,
    count: 1,
    latestTitle: d.title,
    moods: d.mood ? [d.mood] : [],
  }));
}

/**
 * 创建新日记（保存原始输入）
 */
export async function createDiaryEntry(
  userId: string,
  date: string,
  title: string,
  content: string,
  options: {
    mood?: string;
    weather?: string;
    isVoice?: boolean;
    voiceDuration?: number;
    images?: string[];
  } = {}
): Promise<DiaryEntry> {
  const inputType = options.isVoice ? 'voice' : (options.images?.length ? 'image' : 'text');
  
  const raw = await saveDiaryRaw(userId, inputType, content, {
    imageUrls: options.images || [],
    metadata: {
      date,
      title,
      mood: options.mood,
      weather: options.weather,
      voice_duration: options.voiceDuration,
    },
  });

  return convertRawToDiaryEntry(raw);
}

/**
 * 更新日记（更新整理后的日记）
 */
export async function updateDiaryEntry(
  id: string,
  userId: string,
  updates: {
    title?: string;
    content?: string;
    mood?: string;
    weather?: string;
    images?: string[];
  }
): Promise<boolean> {
  // 这里需要查询出 diary_date，简化处理：假设 id 就是 diary_date
  const diaryDate = id; // 实际应该从数据库查询
  
  const existing = await getDiaryProcessed(userId, diaryDate);
  if (!existing) return false;

  await upsertDiaryProcessed(userId, diaryDate, {
    ...updates,
  });

  return true;
}

/**
 * 删除日记
 */
export async function deleteDiaryEntry(
  id: string,
  userId: string
): Promise<boolean> {
  // 这里需要查询出 diary_date，简化处理：假设 id 就是 diary_date
  const diaryDate = id;
  
  return await deleteDiaryProcessed(userId, diaryDate);
}

/**
 * 搜索日记
 */
export async function searchDiary(
  userId: string,
  query: string
): Promise<DiaryEntry[]> {
  const results = await searchDiaries(userId, query);
  return results.map(convertProcessedToDiaryEntry);
}

export const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' },
  { emoji: '😢', label: '难过' },
  { emoji: '😡', label: '生气' },
  { emoji: '🤔', label: '思考' },
  { emoji: '😴', label: '困了' },
  { emoji: '🤩', label: '兴奋' },
  { emoji: '😨', label: '害怕' },
  { emoji: '🥰', label: '温暖' },
  { emoji: '😤', label: '不服' },
  { emoji: '😎', label: '酷' },
];

export const WEATHER_OPTIONS = [
  { emoji: '☀️', label: '晴天' },
  { emoji: '⛅', label: '多云' },
  { emoji: '🌧️', label: '下雨' },
  { emoji: '❄️', label: '下雪' },
  { emoji: '🌈', label: '彩虹' },
  { emoji: '🌙', label: '夜晚' },
  { emoji: '💨', label: '刮风' },
  { emoji: '🌫️', label: '雾天' },
];
