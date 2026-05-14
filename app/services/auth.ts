import { error, warn } from '../lib/console';
import { User, ChildAccount } from '../types';

const AUTH_TOKEN_KEY = 'dobi_auth_token';
const USER_DATA_KEY = 'dobi_user_data';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  private constructor() {
    this.loadUserFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUserFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem(USER_DATA_KEY);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (userData) {
          this.currentUser = JSON.parse(userData);
          this.notifyListeners();
        }
      }
    } catch (err) {
      error('Failed to load user from storage:', err);
    }
  }

  private saveUserToStorage(token?: string) {
    try {
      if (typeof window !== 'undefined') {
        if (this.currentUser) {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.currentUser));
          if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
          }
        } else {
          localStorage.removeItem(USER_DATA_KEY);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }
    } catch (err) {
      error('Failed to save user to storage:', err);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // ===== 家长登录 =====
  async login(username: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '登录失败');
    }

    const data = await response.json();
    this.currentUser = data.user;
    this.saveUserToStorage(data.token);
    this.notifyListeners();
    return data.user;
  }

  // ===== 孩子 PIN 登录 =====
  async childLogin(childId: string, pin: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, childId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '登录失败');
    }

    const data = await response.json();
    this.currentUser = data.user;
    this.saveUserToStorage(data.token);
    this.notifyListeners();
    return data.user;
  }

  // ===== 家长注册 =====
  async register(username: string, password: string, phone?: string, realName?: string): Promise<User> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password, phone, realName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '注册失败');
    }

    const data = await response.json();
    // 注册成功后自动登录
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: 'include',
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        this.currentUser = loginData.user;
        this.saveUserToStorage(loginData.token);
        this.notifyListeners();
        return loginData.user;
      }
    } catch (loginErr) {
      warn('Auto-login after registration failed:', loginErr);
    }

    this.currentUser = data.user;
    this.saveUserToStorage();
    this.notifyListeners();
    return data.user;
  }

  // ===== 获取孩子列表 =====
  async getChildren(): Promise<ChildAccount[]> {
    const token = this.getToken();
    if (!token) throw new Error('未登录');

    const response = await fetch('/api/children', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取孩子列表失败');
    }

    const data = await response.json();
    return data.children;
  }

  // ===== 创建孩子账号 =====
  async createChild(childName: string, grade: string, pinCode: string, avatarUrl?: string): Promise<ChildAccount> {
    const token = this.getToken();
    if (!token) throw new Error('未登录');

    const response = await fetch('/api/children', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ childName, grade, pinCode, avatarUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '创建孩子账号失败');
    }

    const data = await response.json();
    return data.child;
  }

  // ===== 更新孩子信息 =====
  async updateChild(childId: string, updates: Partial<{
    childName: string;
    grade: string;
    pinCode: string;
    isActive: boolean;
    avatarUrl: string;
  }>): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('未登录');

    const response = await fetch(`/api/children/${childId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '更新失败');
    }
  }

  // ===== 停用孩子账号 =====
  async deactivateChild(childId: string): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('未登录');

    const response = await fetch(`/api/children/${childId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '停用失败');
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.saveUserToStorage();
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  }
}

export const authService = AuthService.getInstance();
