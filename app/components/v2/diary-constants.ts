/**
 * 魔法日记 - 常量和工具函数
 */

export const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' }, { emoji: '😢', label: '难过' }, { emoji: '😡', label: '生气' },
  { emoji: '🤔', label: '思考' }, { emoji: '😴', label: '困了' }, { emoji: '🥳', label: '兴奋' },
  { emoji: '😨', label: '害怕' }, { emoji: '🥰', label: '温暖' }, { emoji: '😤', label: '不服' }, { emoji: '😎', label: '酷' },
];

export const WEATHER_OPTIONS = [
  { emoji: '☀️', label: '晴天' }, { emoji: '⛅', label: '多云' }, { emoji: '🌧️', label: '下雨' },
  { emoji: '🌨️', label: '下雪' }, { emoji: '🌈', label: '彩虹' }, { emoji: '🌙', label: '夜晚' },
  { emoji: '💨', label: '刮风' }, { emoji: '🌫️', label: '雾天' },
];

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}
