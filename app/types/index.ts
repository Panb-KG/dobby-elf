// Dobi-elf 统一类型定义
// 将所有类型集中管理，便于维护和复用

// ===== 用户相关类型 =====

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
  points: number;
  level: string;
  treeGrowth: number;
  dailyTasks: DailyTask[];
}

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  reward: number;
}

// ===== 课程相关类型 =====

export interface Course {
  id?: string;
  day: string;
  subject: string;
  time: string;
  type: '校内' | '课外';
  color?: string;
}

export type ScheduleView = 'week' | 'day';

// ===== 成就相关类型 =====

export interface Achievement {
  id: string | number;
  title: string;
  date: string;
  type: string;
  iconName: string;
  color: string;
}

// ===== 作业相关类型 =====

export interface HomeworkTask {
  id: string;
  subject: string;
  title: string;
  status: HomeworkStatus | 'overdue';
  dueDate: string;
  image: string | null;
}

export type HomeworkStatus = 'pending' | 'in_progress' | 'completed';
export type HomeworkType = 'math' | 'english' | 'chinese' | 'science' | 'other';

// ===== 练习相关类型 =====

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Exercise {
  subject: string;
  grade: string;
  questions: Question[];
  currentQuestionIndex?: number;
}

// ===== 聊天相关类型 =====

export interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp?: string;
  image?: string | null;
}

export interface ChatStreamOptions {
  messages: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
}

export interface ChatStreamResponse {
  text: string;
}

// ===== 专注相关类型 =====

export interface FocusSession {
  id: string;
  startTime: string;
  duration: number; // seconds
  completed: boolean;
  whiteNoise?: 'none' | 'library' | 'rain' | 'fire';
}

export type WhiteNoiseType = 'none' | 'library' | 'rain' | 'fire';

// ===== 知识图谱相关类型 =====

export interface KnowledgePoint {
  name: string;
  status: 'mastered' | 'learning';
  subject: string;
}

// ===== 提醒相关类型 =====

export interface Reminder {
  subject: string;
  time: string;
}

// ===== 快捷指令类型 =====

export interface Spell {
  id: string;
  name: string;
  prompt: string;
  icon?: string; // 图标名称（可选）
}

// ===== API 响应类型 =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===== 组件通用类型 =====

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// ===== 导出所有类型 =====
// 所有类型已在上方直接 export，无需重复导出
