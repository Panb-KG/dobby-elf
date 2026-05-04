import { error, warn } from '../lib/console';
import { User } from './types';

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
    } catch (error) {
      error('Failed to load user from storage:', error);
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
    } catch (error) {
      error('Failed to save user to storage:', error);
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

  async login(username: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
      credentials: 'include', // 包含 cookie
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

  async register(username: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '注册失败');
    }

    const data = await response.json();

    // 注册成功后自动登录（直接调用登录接口获取 token）
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        this.currentUser = loginData.user;
        this.saveUserToStorage(loginData.token);
        this.notifyListeners();
        return loginData.user;
      }
    } catch (loginError) {
      warn('Auto-login after registration failed:', loginError);
      // 即使自动登录失败，仍然返回注册用户信息
    }

    this.currentUser = data.user;
    this.saveUserToStorage();
    this.notifyListeners();

    return data.user;
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
