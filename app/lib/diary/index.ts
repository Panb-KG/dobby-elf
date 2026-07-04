/**
 * 日记模块 - Supabase 实现
 * 
 * 提供日记的 CRUD 操作，兼容旧接口
 */

import {
  saveDiaryRaw,
  getDiaryRaws,
  getDiaryRawById,
  updateDiaryRaw,
  deleteDiaryRawById,
  upsertDiaryProcessed,
  getDiaryProcessed,
  getDiaryProcessedList,
  deleteDiaryProcessed,
  searchDiaries,
  convertRawToDiaryEntry,
  convertProcessedToDiaryEntry,
} from '../supabase-diary';

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
 * 更新日记
 * 
 * 优先更新 diary_processed，如果不存在则更新 diary_raw
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
  // 先尝试查找 diary_processed（通过 id 查）
  // 但 diary_processed 的主键是 id，先尝试
  const processed = await getDiaryProcessed(userId, id);
  if (processed) {
    await upsertDiaryProcessed(userId, processed.diary_date, {
      title: updates.title,
      content: updates.content,
      mood: updates.mood,
      weather: updates.weather,
      images: updates.images,
    });
    return true;
  }

  // 如果不存在 processed，查找 diary_raw
  const raw = await getDiaryRawById(id, userId);
  if (raw) {
    const newMetadata = {
      ...raw.metadata,
      title: updates.title ?? raw.metadata?.title,
      mood: updates.mood ?? raw.metadata?.mood,
      weather: updates.weather ?? raw.metadata?.weather,
    };
    return await updateDiaryRaw(id, userId, {
      rawContent: updates.content ?? raw.raw_content,
      imageUrls: updates.images ?? raw.image_urls,
      metadata: newMetadata,
    });
  }

  return false;
}

/**
 * 删除日记
 */
export async function deleteDiaryEntry(
  id: string,
  userId: string
): Promise<boolean> {
  // 先尝试删除 diary_processed（通过 id）
  // 再尝试删除 diary_raw
  const raw = await getDiaryRawById(id, userId);
  if (raw) {
    const date = raw.metadata?.date || new Date(raw.created_at).toISOString().split('T')[0];
    // 同时删除关联的 processed 日记
    await deleteDiaryProcessed(userId, date);
    return await deleteDiaryRawById(id, userId);
  }

  // 尝试直接删除 processed
  return await deleteDiaryProcessed(userId, id);
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
