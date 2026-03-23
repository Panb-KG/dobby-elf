// 全局配置和常量

// 应用基本信息
export const APP_INFO = {
  name: "魔法小课桌",
  subtitle: "Dobby's Magic Desk",
  description: "一个充满魔法的学习助手，让学习变得有趣",
  version: "1.0.0",
};

// 颜色配置
export const COLORS = {
  // 主色调
  magicBg: "#0a0502",
  magicAccent: "#ff4e00",
  magicGlass: "rgba(255, 80, 20, 0.08)",
  magicBorder: "rgba(255, 200, 150, 0.15)",
  
  // 功能色
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  
  // 文本色
  textPrimary: "#f5f5f4",
  textSecondary: "#d6d3d1",
  textTertiary: "#a8a29e",
  textDisabled: "#78716c",
  
  // 背景色
  bgPrimary: "#0a0502",
  bgSecondary: "rgba(255, 255, 255, 0.05)",
  bgTertiary: "rgba(255, 255, 255, 0.1)",
  bgDisabled: "rgba(255, 255, 255, 0.03)",
};

// 字体配置
export const FONTS = {
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  serif: "'Cormorant Garamond', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

// 字体大小
export const FONT_SIZES = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  md: "1.125rem", // 18px
  lg: "1.25rem", // 20px
  xl: "1.5rem", // 24px
  "2xl": "1.75rem", // 28px
  "3xl": "2rem", // 32px
  "4xl": "2.5rem", // 40px
};

// 间距配置
export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
};

// 圆角配置
export const BORDER_RADIUS = {
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
};

// 阴影配置
export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  accent: "0 0 15px rgba(255, 78, 0, 0.3)",
};

// 动画配置
export const ANIMATIONS = {
  duration: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
  },
  easing: {
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

// 魔法咒语（快捷功能）
export const SPELLS = [
  {
    id: 'schedule',
    name: '课程表',
    prompt: '多比，帮我看看我的课程安排，或者帮我制定一个学习计划吧！',
  },
  {
    id: 'homework',
    name: '作业',
    prompt: '多比，帮我管理我的作业，上传作业材料，或者查看作业任务。',
  },
  {
    id: 'words',
    name: '学单词',
    prompt: '多比，我想学习一些新单词，或者帮我翻译一下：',
  },
  {
    id: 'math',
    name: '互动练习',
    prompt: '多比，我想练习一下最近学的知识点，帮我出几道题吧！',
  },
  {
    id: 'focus',
    name: '魔法专注',
    prompt: '多比，我想开始一段专注学习，帮我开启魔法沙漏吧！',
  },
  {
    id: 'achievements',
    name: '成就墙',
    prompt: '多比，快来看看我的成就墙，帮我记录一下新的荣誉，或者看看我攒了多少积分啦！',
  },
];

// 白噪音选项
export const WHITE_NOISE_OPTIONS = [
  { id: 'none', name: '静音' },
  { id: 'library', name: '魔法图书馆' },
  { id: 'rain', name: '禁林细雨' },
  { id: 'fire', name: '休息室壁炉' },
];

// 等级配置
export const LEVELS = [
  { minPoints: 0, maxPoints: 999, level: '魔法学徒' },
  { minPoints: 1000, maxPoints: 1999, level: '初级魔法师' },
  { minPoints: 2000, maxPoints: 2999, level: '中级魔法师' },
  { minPoints: 3000, maxPoints: 4999, level: '高级魔法师' },
  { minPoints: 5000, maxPoints: Infinity, level: '大魔法师' },
];

// 每日任务
export const DAILY_TASKS = [
  { id: 'task1', text: '完成3道奥数题', completed: false, reward: 50 },
  { id: 'task2', text: '背诵5个新单词', completed: false, reward: 30 },
  { id: 'task3', text: '查看今日课程表', completed: false, reward: 10 },
];

// 课程类型
export const COURSE_TYPES = [
  { value: '校内', label: '校内' },
  { value: '课外', label: '课外' },
];

// 星期选项
export const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 课程颜色
export const COURSE_COLORS = [
  'bg-blue-500/20 border-blue-500/30',
  'bg-purple-500/20 border-purple-500/30',
  'bg-amber-500/20 border-amber-500/30',
  'bg-emerald-500/20 border-emerald-500/30',
  'bg-rose-500/20 border-rose-500/30',
  'bg-sky-500/20 border-sky-500/30',
  'bg-indigo-500/20 border-indigo-500/30',
];

// 作业状态
export const HOMEWORK_STATUS = [
  { value: 'pending', label: '待完成', color: 'bg-magic-accent/20 text-magic-accent' },
  { value: 'in_progress', label: '进行中', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'completed', label: '已完成', color: 'bg-emerald-500/20 text-emerald-400' },
];

// 作业类型
export const HOMEWORK_TYPES = [
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  { value: 'chinese', label: '语文' },
  { value: 'science', label: '科学' },
  { value: 'other', label: '其他' },
];

// 文件类型图标映射
export const FILE_TYPE_ICONS = {
  'image': 'ImageIcon',
  'pdf': 'File',
  'document': 'FileText',
  'video': 'Video',
  'audio': 'Music',
};

// API配置
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

// 响应式断点
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// 导出默认配置
export default {
  APP_INFO,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
  SPELLS,
  WHITE_NOISE_OPTIONS,
  LEVELS,
  DAILY_TASKS,
  COURSE_TYPES,
  WEEKDAYS,
  COURSE_COLORS,
  HOMEWORK_STATUS,
  HOMEWORK_TYPES,
  FILE_TYPE_ICONS,
  API_CONFIG,
  BREAKPOINTS,
};