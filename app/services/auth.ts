import { error, warn } from '../lib/console';
import { User, ChildAccount, UserRole } from '../types';
import { getSupabaseBrowserClient } from '../lib/supabase';

const AUTH_TOKEN_KEY = 'dobi_auth_token';
const USER_DATA_KEY = 'dobi_user_data';

// Supabase Auth 用假 email（用户名登录）
// 必须使用有效的邮箱格式，否则 Supabase Auth 会拒绝
function toFakeEmail(username: string): string {
  // 清理用户名：只保留字母数字和下划线，确保邮箱格式有效
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `${cleanUsername}@dobby-elf.app`;
}

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

  // ========== 本地存储 ==========

  private loadUserFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem(USER_DATA_KEY);
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
          if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
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

  // ========== Supabase 行 ↔ User 类型转换 ==========

  private profileToUser(profile: Record<string, unknown>, token?: string): User {
    return {
      id: profile.id as string,
      username: (profile.username as string) || '',
      displayName: (profile.display_name as string) || (profile.username as string) || '',
      email: (profile.id as string) || '',
      role: (profile.role as UserRole) || 'parent',
      parentId: profile.parent_id as string | undefined,
      childName: profile.child_name as string | undefined,
      grade: profile.grade ? String(profile.grade) : undefined,
      pinCode: profile.pin_code as string | undefined,
      isActive: profile.is_active as boolean | undefined,
      createdAt: (profile.created_at as string) || new Date().toISOString(),
      points: (profile.points as number) || 0,
      level: String(profile.level || 1),
      treeGrowth: (profile.tree_growth as number) || 0,
      dailyTasks: [],
    };
  }

  // ========== 家长登录（Supabase Auth） ==========

  async login(username: string, password: string): Promise<User> {
    const supabase = getSupabaseBrowserClient();
    const fakeEmail = toFakeEmail(username);

    // 1. Supabase Auth 登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    });

    if (authError || !authData.user) {
      // 将 Supabase 英文错误信息翻译为中文
      const errorMsg = authError?.message || '';
      let chineseMsg = '登录失败，请重试';
      if (errorMsg.includes('Invalid login credentials')) {
        chineseMsg = '用户名或密码错误，请重试';
      } else if (errorMsg.includes('Email not confirmed')) {
        chineseMsg = '账号尚未验证，请联系管理员';
      } else if (errorMsg.includes('rate limit')) {
        chineseMsg = '尝试次数太多，请稍后再试';
      }
      throw new Error(chineseMsg);
    }

    // 2. 获取 profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('用户资料不存在，请联系管理员');
    }

    const user = this.profileToUser(profile, authData.session?.access_token);
    this.currentUser = user;
    this.saveUserToStorage(authData.session?.access_token);
    this.notifyListeners();
    return user;
  }

  // ========== 孩子 PIN 登录（不走 Supabase Auth） ==========

  async childLogin(childId: string, pin: string): Promise<User> {
    const supabase = getSupabaseBrowserClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', childId)
      .eq('pin_code', pin)
      .eq('is_active', true)
      .single();

    if (profileError || !profile) {
      throw new Error('PIN 码错误，请重试');
    }

    // 用自定义 session（不依赖 Supabase Auth）
    const fakeToken = `child_${profile.id}_${Date.now()}`;
    const user = this.profileToUser(profile, fakeToken);
    this.currentUser = user;
    this.saveUserToStorage(fakeToken);
    this.notifyListeners();
    return user;
  }

  // ========== 家长注册 ==========

  async register(username: string, password: string, phone?: string, realName?: string): Promise<User> {
    const supabase = getSupabaseBrowserClient();
    const fakeEmail = toFakeEmail(username);

    // 1. 先检查用户名是否已存在
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle();

    if (existing) {
      throw new Error('用户名已存在，请选择其他用户名');
    }

    // 2. Supabase Auth 注册
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          username: username.trim(),
          display_name: realName || username.trim(),
        },
      },
    });

    if (authError || !authData.user) {
      // 将 Supabase 英文错误信息翻译为中文
      const errorMsg = authError?.message || '';
      let chineseMsg = '注册失败，请重试';
      if (errorMsg.includes('User already registered')) {
        chineseMsg = '该用户名已存在，请换个名字';
      } else if (errorMsg.includes('Password should be at least')) {
        chineseMsg = '密码太短，至少需要6个字符';
      } else if (errorMsg.includes('Email rate limit')) {
        chineseMsg = '注册太频繁，请稍后再试';
      }
      throw new Error(chineseMsg);
    }

    // 3. 等待 profile 被 trigger 创建（或手动创建）
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      // trigger 可能还没跑完，手动插入
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username.trim(),
          display_name: realName || username.trim(),
          role: 'parent',
          points: 0,
          level: 1,
          tree_growth: 0,
          is_active: true,
        })
        .select()
        .single();

      if (insertError || !newProfile) {
        throw new Error('创建用户资料失败: ' + (insertError?.message || '未知错误'));
      }
      profile = newProfile;
    }

    const user = this.profileToUser(profile, authData.session?.access_token);
    this.currentUser = user;
    this.saveUserToStorage(authData.session?.access_token);
    this.notifyListeners();
    return user;
  }

  // ========== 获取孩子列表 ==========

  async getChildren(): Promise<ChildAccount[]> {
    if (!this.currentUser) throw new Error('未登录');

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('parent_id', this.currentUser.id)
      .eq('is_active', true);

    if (error) throw new Error(error.message);

    return (data || []).map(p => ({
      id: p.id as string,
      username: p.username as string,
      displayName: (p.display_name as string) || (p.username as string) || '',
      childName: (p.child_name as string) || '',
      grade: p.grade ? String(p.grade) : '',
      pinCode: (p.pin_code as string) || '',
      avatarUrl: (p.avatar_url as string) || '',
      isActive: (p.is_active as boolean) !== false,
      points: (p.points as number) || 0,
      level: String(p.level || 1),
      treeGrowth: (p.tree_growth as number) || 0,
      createdAt: (p.created_at as string) || '',
    }));
  }

  // ========== 创建孩子账号 ==========

  async createChild(childName: string, grade: string, pinCode: string, avatarUrl?: string): Promise<ChildAccount> {
    if (!this.currentUser) throw new Error('未登录');

    const supabase = getSupabaseBrowserClient();
    const username = `child_${Date.now()}_${(Math.random() * 1000).toFixed(0)}`;

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        username,
        display_name: childName,
        child_name: childName,
        grade: parseInt(grade) || null,
        pin_code: pinCode,
        parent_id: this.currentUser.id,
        role: 'child',
        points: 0,
        level: 1,
        tree_growth: 0,
        is_active: true,
        avatar_url: avatarUrl || null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || '创建孩子账号失败');
    }

    return {
      id: data.id as string,
      username: data.username as string,
      displayName: (data.display_name as string) || '',
      childName: (data.child_name as string) || '',
      grade: data.grade ? String(data.grade) : '',
      pinCode: (data.pin_code as string) || '',
      avatarUrl: (data.avatar_url as string) || '',
      isActive: true,
      points: 0,
      level: '1',
      treeGrowth: 0,
      createdAt: data.created_at as string,
    };
  }

  // ========== 更新孩子信息 ==========

  async updateChild(childId: string, updates: Partial<{
    childName: string;
    grade: string;
    pinCode: string;
    isActive: boolean;
    avatarUrl: string;
  }>): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    const updateData: Record<string, unknown> = {};
    if (updates.childName !== undefined) {
      updateData.child_name = updates.childName;
      updateData.display_name = updates.childName;
    }
    if (updates.grade !== undefined) updateData.grade = parseInt(updates.grade) || null;
    if (updates.pinCode !== undefined) updateData.pin_code = updates.pinCode;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', childId);

    if (error) throw new Error(error.message);
  }

  // ========== 停用孩子账号 ==========

  async deactivateChild(childId: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', childId);

    if (error) throw new Error(error.message);
  }

  // ========== 登出 ==========

  async logout(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    this.currentUser = null;
    this.saveUserToStorage();
    this.notifyListeners();
  }

  // ========== 工具方法 ==========

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
