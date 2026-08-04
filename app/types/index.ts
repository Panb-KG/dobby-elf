// Dobi-elf 统一类型定义
// 将所有类型集中管理，便于维护和复用

// ===== 用户相关类型 =====

export type UserRole = 'parent' | 'child';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  parentId?: string;
  childName?: string;
  grade?: string;
  pinCode?: string;
  isActive?: boolean;
  createdAt: string;
  points: number;
  level: string;
  treeGrowth: number;
  dailyTasks: DailyTask[];
}

export interface ChildAccount {
  id: string;
  username: string;
  displayName: string;
  childName: string;
  grade: string;
  pinCode: string;
  avatarUrl: string;
  isActive: boolean;
  points: number;
  level: string;
  treeGrowth: number;
  createdAt: string;
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
  files?: Array<{ mimeType: string; data: string }>;
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

// ===== 星光档案相关类型 =====

export type PortfolioCategory = 'award' | 'certificate' | 'report_card' | 'photo' | 'artwork' | 'activity' | 'other';

export interface PortfolioItem {
  id: string;
  user_id: string;
  category: PortfolioCategory;
  title: string;
  description: string | null;
  event_date: string | null;
  source: string | null;
  storage_path: string | null;
  thumbnail_path: string | null;
  file_type: string | null;
  tags: string[];
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** 前端用：文件 URL（通过签名 URL 或公开 URL 获取） */
  fileUrl?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  purpose: string | null;
  style: string | null;
  time_range_start: string | null;
  time_range_end: string | null;
  extra_prompt: string | null;
  title: string | null;
  content: string | null;
  portfolio_item_ids: string[];
  created_at: string;
}

export const PORTFOLIO_CATEGORY_LABELS: Record<PortfolioCategory, string> = {
  award: '🏆 奖状荣誉',
  certificate: '📜 证书',
  report_card: '📊 成绩单',
  photo: '📷 重要照片',
  artwork: '🎨 作品',
  activity: '🎯 活动记录',
  other: '📁 其他',
};

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
