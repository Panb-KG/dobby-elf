import { User, Course, Achievement, KnowledgePoint, DailyTask } from './types';

export class DataService {
  private static instance: DataService;

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // 获取认证令牌
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dobby_auth_token');
    }
    return null;
  }

  // 创建带认证的请求头
  private createAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        headers: this.createAuthHeaders(),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: this.createAuthHeaders(),
        body: JSON.stringify({ userId: user.id, updates: user }),
      });
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: this.createAuthHeaders(),
        body: JSON.stringify({ userId, updates }),
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }

  async getCourses(userId: string): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses?userId=${userId}`, {
        headers: this.createAuthHeaders(),
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to get courses:', error);
      return [];
    }
  }

  async saveCourse(userId: string, course: Course): Promise<void> {
    try {
      await fetch('/api/courses', {
        method: 'POST',
        headers: this.createAuthHeaders(),
        body: JSON.stringify({ userId, course }),
      });
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  }

  async deleteCourse(userId: string, courseId: string): Promise<void> {
    try {
      await fetch(`/api/courses?userId=${userId}&courseId=${courseId}`, {
        method: 'DELETE',
        headers: this.createAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response = await fetch(`/api/achievements?userId=${userId}`, {
        headers: this.createAuthHeaders(),
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }

  async saveAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      await fetch('/api/achievements', {
        method: 'POST',
        headers: this.createAuthHeaders(),
        body: JSON.stringify({ userId, achievement }),
      });
    } catch (error) {
      console.error('Failed to save achievement:', error);
    }
  }

  async getKnowledgeGraph(userId: string): Promise<KnowledgePoint[]> {
    try {
      const response = await fetch(`/api/knowledge?userId=${userId}`, {
        headers: this.createAuthHeaders(),
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to get knowledge graph:', error);
      return [];
    }
  }

  async saveKnowledgeGraph(userId: string, points: KnowledgePoint[]): Promise<void> {
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: this.createAuthHeaders(),
        body: JSON.stringify({ userId, points }),
      });
    } catch (error) {
      console.error('Failed to save knowledge graph:', error);
    }
  }
}

export const dataService = DataService.getInstance();