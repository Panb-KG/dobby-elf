// Stub: SQLite diary module replaced by Supabase
// These functions return empty data until Supabase queries are implemented

export interface DiaryEntry {
  id: string; userId: string; date: string; title: string; content: string;
  mood?: string; weather?: string; isVoice?: boolean; voiceDuration?: number;
  images?: string[]; createdAt: string; updatedAt: string;
}

export function getDiaryEntries(): DiaryEntry[] { return []; }
export function getDiaryDates(): { date: string; count: number; latestTitle: string; moods: string[] }[] { return []; }
export function createDiaryEntry(): DiaryEntry { throw new Error('Not implemented'); }
export function updateDiaryEntry(): boolean { return false; }
export function deleteDiaryEntry(): boolean { return false; }
export function searchDiary(): DiaryEntry[] { return []; }

export const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' }, { emoji: '😢', label: '难过' }, { emoji: '😡', label: '生气' },
  { emoji: '', label: '思考' }, { emoji: '😴', label: '困了' }, { emoji: '', label: '兴奋' },
  { emoji: '😨', label: '害怕' }, { emoji: '', label: '温暖' }, { emoji: '', label: '不服' }, { emoji: '', label: '酷' },
];

export const WEATHER_OPTIONS = [
  { emoji: '☀️', label: '晴天' }, { emoji: '⛅', label: '多云' }, { emoji: '️', label: '下雨' },
  { emoji: '️', label: '下雪' }, { emoji: '', label: '彩虹' }, { emoji: '', label: '夜晚' },
  { emoji: '💨', label: '刮风' }, { emoji: '', label: '雾天' },
];
