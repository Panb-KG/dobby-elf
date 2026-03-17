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