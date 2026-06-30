import { error, warn } from '../lib/console';
import { User, UserRole } from '../types';
import { requireSupabaseClient } from '../lib/supabase';
import { profileToUser } from './data-converters';
import { getChildren as fetchChildren, createChild as createChildAccount, updateChild as updateChildInfo, deactivateChild as deactivateChildAccount } from './auth-children';
import type { ChildAccount } from '../types';

const AUTH_TOKEN_KEY = 'dobi_auth_token';
const USER_DATA_KEY = 'dobi_user_data';

function toFakeEmail(username: string): string {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `${cleanUsername}@dobby-elf.app`;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  private constructor() { this.loadUserFromStorage(); }

  static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  // ========== 本地存储 ==========

  private loadUserFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem(USER_DATA_KEY);
        if (userData) { this.currentUser = JSON.parse(userData); this.notifyListeners(); }
      }
    } catch (err) { error('Failed to load user from storage:', err); }
  }

  private saveUserToStorage(token?: string) {
    try {
      if (typeof window !== 'undefined') {
        if (this.currentUser) {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.currentUser));
          if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
        } else {
          localStorage.removeItem(USER_DATA_KEY);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }
    } catch (err) { error('Failed to save user to storage:', err); }
  }

  private notifyListeners() { this.listeners.forEach(l => l(this.currentUser)); }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => { this.listeners = this.listeners.filter(l => l !== callback); };
  }

  // ========== 家长登录 ==========

  async login(username: string, password: string): Promise<User> {
    const supabase = requireSupabaseClient();
    const fakeEmail = toFakeEmail(username);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });

    if (authError || !authData.user) {
      const errorMsg = authError?.message || '';
      let chineseMsg = '登录失败，请重试';
      if (errorMsg.includes('Invalid login credentials')) chineseMsg = '用户名或密码错误，请重试';
      else if (errorMsg.includes('Email not confirmed')) chineseMsg = '账号尚未验证，请联系管理员';
      else if (errorMsg.includes('rate limit')) chineseMsg = '尝试次数太多，请稍后再试';
      throw new Error(chineseMsg);
    }

    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
    if (profileError || !profile) throw new Error('用户资料不存在，请联系管理员');

    const user = profileToUser(profile);
    this.currentUser = user;
    this.saveUserToStorage(authData.session?.access_token);
    this.notifyListeners();
    return user;
  }

  // ========== 孩子 PIN 登录 ==========

  async childLogin(childId: string, pin: string): Promise<User> {
    const supabase = requireSupabaseClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', childId).eq('pin_code', pin).eq('is_active', true).single();

    if (profileError || !profile) throw new Error('PIN 码错误，请重试');

    const fakeToken = `child_${profile.id}_${Date.now()}`;
    const user = profileToUser(profile);
    this.currentUser = user;
    this.saveUserToStorage(fakeToken);
    this.notifyListeners();
    return user;
  }

  // ========== 家长注册 ==========

  async register(username: string, password: string, phone?: string, realName?: string): Promise<User> {
    const supabase = requireSupabaseClient();
    const fakeEmail = toFakeEmail(username);

    const { data: existing } = await supabase.from('profiles').select('id').eq('username', username.trim()).maybeSingle();
    if (existing) throw new Error('用户名已存在，请选择其他用户名');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fakeEmail, password,
      options: { data: { username: username.trim(), display_name: realName || username.trim() } },
    });

    if (authError || !authData.user) {
      const errorMsg = authError?.message || '';
      let chineseMsg = '注册失败，请重试';
      if (errorMsg.includes('User already registered')) chineseMsg = '该用户名已存在，请换个名字';
      else if (errorMsg.includes('Password should be at least')) chineseMsg = '密码太短，至少需要6个字符';
      else if (errorMsg.includes('Email rate limit')) chineseMsg = '注册太频繁，请稍后再试';
      throw new Error(chineseMsg);
    }

    let { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();

    if (profileError || !profile) {
      const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({
        id: authData.user.id, username: username.trim(), display_name: realName || username.trim(),
        role: 'parent', points: 0, level: 1, tree_growth: 0, is_active: true,
      }).select().single();

      if (insertError || !newProfile) throw new Error('创建用户资料失败: ' + (insertError?.message || '未知错误'));
      profile = newProfile;
    }

    const user = profileToUser(profile);
    this.currentUser = user;
    this.saveUserToStorage(authData.session?.access_token);
    this.notifyListeners();
    return user;
  }

  // ========== 子账号管理（委托给 auth-children.ts）==========

  async getChildren(): Promise<ChildAccount[]> {
    if (!this.currentUser) throw new Error('未登录');
    return fetchChildren(this.currentUser.id);
  }

  async createChild(childName: string, grade: string, pinCode: string, avatarUrl?: string): Promise<ChildAccount> {
    if (!this.currentUser) throw new Error('未登录');
    return createChildAccount(this.currentUser.id, childName, grade, pinCode, avatarUrl);
  }

  async updateChild(childId: string, updates: Partial<{ childName: string; grade: string; pinCode: string; isActive: boolean; avatarUrl: string }>): Promise<void> {
    return updateChildInfo(childId, updates);
  }

  async deactivateChild(childId: string): Promise<void> {
    return deactivateChildAccount(childId);
  }

  // ========== 登出 ==========

  async logout(): Promise<void> {
    const supabase = requireSupabaseClient();
    await supabase.auth.signOut();
    this.currentUser = null;
    this.saveUserToStorage();
    this.notifyListeners();
  }

  // ========== 工具方法 ==========

  getCurrentUser(): User | null { return this.currentUser; }

  getToken(): string | null {
    if (typeof window !== 'undefined') return localStorage.getItem(AUTH_TOKEN_KEY);
    return null;
  }
}

export const authService = AuthService.getInstance();
