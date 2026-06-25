/**
 * 魔法日记模块
 * 
 * 小朋友的文字/语音日记，按日期存储和编辑
 * v2.0 新增
 */

import { getDb } from '../db';

export interface DiaryEntry {
  id: string;
  userId: string;
  date: string;          // YYYY-MM-DD
  title: string;
  content: string;
  mood?: string;         // emoji: 😊😢😡🤔😴🥳
  weather?: string;      // emoji: ☀️🌧️❄️🌈🌙
  isVoice?: boolean;     // 是否语音输入
  voiceDuration?: number; // 语音时长（秒）
  images?: string[];     // 图片 URL 列表
  createdAt: string;
  updatedAt: string;
}

export interface DiaryDaySummary {
  date: string;
  count: number;
  latestTitle: string;
  moods: string[];
}

/**
 * 获取指定日期的日记
 */
export function getDiaryEntries(userId: string, date: string): DiaryEntry[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT * FROM diary_entries
    WHERE user_id = ? AND date = ?
    ORDER BY created_at ASC
  `).all(userId, date) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    title: row.title,
    content: row.content,
    mood: row.mood || undefined,
    weather: row.weather || undefined,
    isVoice: row.is_voice === 1,
    voiceDuration: row.voice_duration || undefined,
    images: row.images ? JSON.parse(row.images) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * 获取最近的日记日期列表
 */
export function getDiaryDates(userId: string, limit = 30): DiaryDaySummary[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT
      date,
      COUNT(*) as count,
      MAX(title) as latest_title,
      GROUP_CONCAT(DISTINCT mood) as moods
    FROM diary_entries
    WHERE user_id = ?
    GROUP BY date
    ORDER BY date DESC
    LIMIT ?
  `).all(userId, limit) as any[];

  return rows.map(row => ({
    date: row.date,
    count: row.count,
    latestTitle: row.latest_title || '无标题',
    moods: row.moods ? row.moods.split(',').filter(Boolean) : [],
  }));
}

/**
 * 创建日记条目
 */
export function createDiaryEntry(
  userId: string,
  date: string,
  title: string,
  content: string,
  options?: {
    mood?: string;
    weather?: string;
    isVoice?: boolean;
    voiceDuration?: number;
    images?: string[];
  }
): DiaryEntry {
  const db = getDb();
  const id = 'diary_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO diary_entries
    (id, user_id, date, title, content, mood, weather, is_voice, voice_duration, images, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    date,
    title,
    content,
    options?.mood || null,
    options?.weather || null,
    options?.isVoice ? 1 : 0,
    options?.voiceDuration || null,
    options?.images ? JSON.stringify(options.images) : null,
    now,
    now,
  );

  return {
    id,
    userId,
    date,
    title,
    content,
    mood: options?.mood,
    weather: options?.weather,
    isVoice: options?.isVoice || false,
    voiceDuration: options?.voiceDuration,
    images: options?.images || [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 更新日记条目
 */
export function updateDiaryEntry(
  entryId: string,
  userId: string,
  updates: {
    title?: string;
    content?: string;
    mood?: string;
    weather?: string;
    images?: string[];
  }
): boolean {
  const db = getDb();

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.mood !== undefined) {
    fields.push('mood = ?');
    values.push(updates.mood);
  }
  if (updates.weather !== undefined) {
    fields.push('weather = ?');
    values.push(updates.weather);
  }
  if (updates.images !== undefined) {
    fields.push('images = ?');
    values.push(JSON.stringify(updates.images));
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());

  values.push(entryId, userId);

  const result = db.prepare(`
    UPDATE diary_entries
    SET ${fields.join(', ')}
    WHERE id = ? AND user_id = ?
  `).run(...values);

  return result.changes > 0;
}

/**
 * 删除日记条目
 */
export function deleteDiaryEntry(entryId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM diary_entries WHERE id = ? AND user_id = ?
  `).run(entryId, userId);

  return result.changes > 0;
}

/**
 * 搜索日记（按标题或内容）
 */
export function searchDiary(userId: string, query: string, limit = 20): DiaryEntry[] {
  const db = getDb();
  const pattern = `%${query}%`;

  const rows = db.prepare(`
    SELECT * FROM diary_entries
    WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
    ORDER BY date DESC, created_at DESC
    LIMIT ?
  `).all(userId, pattern, pattern, limit) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    title: row.title,
    content: row.content,
    mood: row.mood || undefined,
    weather: row.weather || undefined,
    isVoice: row.is_voice === 1,
    voiceDuration: row.voice_duration || undefined,
    images: row.images ? JSON.parse(row.images) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * 心情选项
 */
export const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' },
  { emoji: '😢', label: '难过' },
  { emoji: '😡', label: '生气' },
  { emoji: '🤔', label: '思考' },
  { emoji: '😴', label: '困了' },
  { emoji: '🥳', label: '兴奋' },
  { emoji: '😨', label: '害怕' },
  { emoji: '🥰', label: '温暖' },
  { emoji: '😤', label: '不服' },
  { emoji: '😎', label: '酷' },
];

/**
 * 天气选项
 */
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
