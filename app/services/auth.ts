import { User } from './types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_TOKEN_KEY = 'dobby_auth_token';
const USER_DATA_KEY = 'dobby_user_data';

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
      const userData = localStorage.getItem(USER_DATA_KEY);
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  }

  private saveUserToStorage() {
    try {
      if (this.currentUser) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(USER_DATA_KEY);
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
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
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '登录失败');
    }
    
    const data = await response.json();
    this.currentUser = data.user;
    this.saveUserToStorage();
    this.notifyListeners();
    
    return data.user;
  }

  async register(username: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '注册失败');
    }
    
    const data = await response.json();
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
}

export const authService = AuthService.getInstance();