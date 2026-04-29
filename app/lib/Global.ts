// 全局配置和常量 - 儿童友好版

// 应用基本信息
export const APP_INFO = {
  name: "魔法小课桌",
  subtitle: "Dobi's Magic Desk",
  description: "一个充满魔法的学习冒险！",
  version: "2.0.0",
};

// ===== 儿童友好的快捷指令 =====
export const SPELLS = [
  {
    id: 'schedule',
    name: '📅 今日课表',
    prompt: '多比，今天有什么课呀？我要带什么？',
  },
  {
    id: 'homework',
    name: '📝 作业本',
    prompt: '多比，今天的作业是什么？我想先做最简单的！',
  },
  {
    id: 'words',
    name: '🌟 学单词',
    prompt: '多比，我想学几个新单词，用好玩的方式教我！',
  },
  {
    id: 'math',
    name: '🎮 闯关练习',
    prompt: '多比，我想玩闯关游戏！出几道题考考我！',
  },
  {
    id: 'focus',
    name: '⏳ 专注沙漏',
    prompt: '多比，开启专注沙漏！我要打败分心怪兽！',
  },
  {
    id: 'achievements',
    name: '🏆 我的宝藏',
    prompt: '多比，快看看我收集了多少宝藏！我升了几级啦？',
  },
];

// ===== 白噪音选项 =====
export const WHITE_NOISE_OPTIONS = [
  { id: 'none', name: '🔇 静音' },
  { id: 'library', name: '📚 魔法图书馆' },
  { id: 'rain', name: '🌧️ 禁林细雨' },
  { id: 'fire', name: '🔥 休息室壁炉' },
];

// ===== 等级系统（儿童友好） =====
export const LEVELS = [
  { minPoints: 0, maxPoints: 999, level: '🌱 魔法学徒', emoji: '🌱' },
  { minPoints: 1000, maxPoints: 1999, level: '⭐ 初级魔法师', emoji: '⭐' },
  { minPoints: 2000, maxPoints: 2999, level: '✨ 中级魔法师', emoji: '✨' },
  { minPoints: 3000, maxPoints: 4999, level: '🌟 高级魔法师', emoji: '🌟' },
  { minPoints: 5000, maxPoints: Infinity, level: '👑 大魔法师', emoji: '👑' },
];

// ===== 每日任务（儿童友好版） =====
export const DAILY_TASKS = [
  { id: 'task1', text: '完成3道闯关题 🎮', completed: false, reward: 50 },
  { id: 'task2', text: '背诵5个新单词 📖', completed: false, reward: 30 },
  { id: 'task3', text: '查看今日课表 📅', completed: false, reward: 10 },
  { id: 'task4', text: '专注学习25分钟 ⏳', completed: false, reward: 40 },
  { id: 'task5', text: '完成一项作业 ✅', completed: false, reward: 30 },
];

// ===== 课程类型 =====
export const COURSE_TYPES = [
  { value: '校内', label: '🏫 校内', color: 'bg-blue-500/20 text-blue-400' },
  { value: '课外', label: '🎨 课外', color: 'bg-purple-500/20 text-purple-400' },
];

// ===== 星期选项 =====
export const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// ===== 课程颜色 =====
export const COURSE_COLORS = [
  'bg-blue-500/20 border-blue-500/30',
  'bg-purple-500/20 border-purple-500/30',
  'bg-amber-500/20 border-amber-500/30',
  'bg-emerald-500/20 border-emerald-500/30',
  'bg-rose-500/20 border-rose-500/30',
  'bg-sky-500/20 border-sky-500/30',
  'bg-indigo-500/20 border-indigo-500/30',
];

// ===== 作业状态 =====
export const HOMEWORK_STATUS = [
  { value: 'pending', label: '🔴 待完成', color: 'bg-magic-accent/20 text-magic-accent' },
  { value: 'in_progress', label: '🟡 进行中', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'completed', label: '🟢 已完成', color: 'bg-emerald-500/20 text-emerald-400' },
];

// ===== 成就类型 =====
export const ACHIEVEMENT_TYPES = {
  homework: { label: '📝 作业达人', points: 50, color: 'text-blue-400' },
  course: { label: '📅 课程之星', points: 20, color: 'text-purple-400' },
  exercise: { label: '🎮 闯关高手', points: 30, color: 'text-amber-400' },
  focus: { label: '⏳ 专注忍者', points: 40, color: 'text-emerald-400' },
  streak: { label: '🔥 连续打卡', points: 60, color: 'text-red-400' },
  special: { label: '🌟 特别成就', points: 100, color: 'text-yellow-400' },
};

// ===== 鼓励语 =====
export const ENCOURAGEMENTS = {
  correct: [
    '太棒了！你真聪明！🌟',
    '答对了！多比为你骄傲！✨',
    '哇，你是小天才！🎉',
    '太厉害了！继续加油！💪',
    '完美！你做到了！🏆',
  ],
  wrong: [
    '没关系，再想想！💭',
    '差一点点！多比相信你！🌈',
    '加油，你可以的！🌟',
    '试试看另一种方法！🎯',
    '错误是学习的一部分！📚',
  ],
  streak: [
    '连续{days}天打卡！你是小勇士！🔥',
    '你已经坚持{days}天了！太厉害了！💪',
    '打卡{days}天！知识之树又长高了！🌳',
  ],
  levelUp: [
    '恭喜升级！你现在是{level}了！🎉',
    '你升到了{level}！多比为你开心！✨',
  ],
};

// ===== 颜色配置 =====
export const COLORS = {
  magicBg: '#0a0502',
  magicAccent: '#ff4e00',
  magicGlass: 'rgba(255, 80, 20, 0.08)',
  magicBorder: 'rgba(255, 200, 150, 0.15)',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// ===== 字体配置 =====
export const FONTS = {
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  serif: "'Cormorant Garamond', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

// ===== 每日问候语 =====
export const DAILY_GREETINGS = {
  morning: [
    '早上好，小勇士！🌅 今天也是充满魔法的一天！',
    '早安！太阳公公出来啦！🌞 准备好开始冒险了吗？',
    '早上好呀！多比已经等你很久了！☀️ 让我们开始今天的学习冒险吧！',
  ],
  afternoon: [
    '下午好！🌤️ 放学后也要加油哦！',
    '嘿！多比在这里等你！🌈 今天有什么想学的？',
    '下午好呀！休息一下吧，然后我们一起学习！📚',
  ],
  evening: [
    '晚上好！🌙 今天辛苦啦！来看看今天的收获吧！',
    '晚上好呀！多比想听听你今天学了什么！⭐',
    '天黑啦，但学习的光芒还在！🌟 来总结一下今天吧！',
  ],
};

// ===== API配置 =====
export const API_CONFIG = {
  chatEndpoint: '/api/chat',
  imageEndpoint: '/api/image',
  authEndpoint: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  userEndpoint: '/api/users',
  coursesEndpoint: '/api/courses',
  achievementsEndpoint: '/api/achievements',
  knowledgeEndpoint: '/api/knowledge',
  homeworkEndpoint: '/api/homework',
};

// ===== 响应式断点 =====
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ===== 导出默认配置 =====
export default {
  APP_INFO,
  COLORS,
  FONTS,
  SPELLS,
  WHITE_NOISE_OPTIONS,
  LEVELS,
  DAILY_TASKS,
  COURSE_TYPES,
  WEEKDAYS,
  COURSE_COLORS,
  HOMEWORK_STATUS,
  ACHIEVEMENT_TYPES,
  ENCOURAGEMENTS,
  DAILY_GREETINGS,
  API_CONFIG,
  BREAKPOINTS,
};
