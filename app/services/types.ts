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

export interface Course {
  id?: string;
  day: string;
  subject: string;
  time: string;
  type: '校内' | '课外';
  color?: string;
}

export interface Achievement {
  id: string | number;
  title: string;
  date: string;
  type: string;
  iconName: string;
  color: string;
}

export interface KnowledgePoint {
  name: string;
  status: 'mastered' | 'learning';
  subject: string;
}

// ===== 新增类型定义 =====

export interface HomeworkTask {
  id: string;
  subject: string;
  title: string;
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
  image: string | null;
}

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

export interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp?: string;
  image?: string | null;
}

export interface FocusSession {
  id: string;
  startTime: string;
  duration: number; // seconds
  completed: boolean;
  whiteNoise?: 'none' | 'library' | 'rain' | 'fire';
}

export interface Reminder {
  subject: string;
  time: string;
}
