'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

/**
 * 小学生友好认证 Context
 * 
 * 认证方式：
 * 1. 用户名登录（无需邮箱）
 * 2. 可选4位PIN（家长可设置）
 * 3. 首次使用自动创建账号
 */

// 自定义应用用户类型（不依赖 Supabase User 类型，避免类型不兼容）
interface AppUser {
  id: string;
  username: string;
  avatarUrl?: string;
  grade?: number;
  role: 'student' | 'parent' | 'teacher';
}

interface AuthContextType {
  user: AppUser | null;
  username: string | null;
  isLoading: boolean;
  login: (username: string, pin?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, pin?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储是否有已登录用户
    const storedUsername = localStorage.getItem('dobby_username');
    if (storedUsername) {
      setUsername(storedUsername);
      loadUser(storedUsername);
    }
    setIsLoading(false);
  }, []);

  async function loadUser(username: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      setUser(null);
      return;
    }

    setUser({
      id: data.id as string,
      username: data.username as string,
      avatarUrl: data.avatar_url as string | undefined,
      grade: data.grade as number | undefined,
      role: (data.role as 'student' | 'parent' | 'teacher') ?? 'student',
    });
    setUsername(data.username);
  }

  async function login(username: string, pin?: string) {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        throw new Error('用户名不存在，请先注册');
      }

      // TODO: 如果设置了PIN，验证PIN
      // if (data.pin && data.pin !== pin) throw new Error('PIN错误');

      localStorage.setItem('dobby_username', username);
      setUsername(username);
      setUser({
        id: data.id as string,
        username: data.username as string,
        avatarUrl: data.avatar_url as string | undefined,
        grade: data.grade as number | undefined,
        role: (data.role as 'student' | 'parent' | 'teacher') ?? 'student',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function register(username: string, pin?: string) {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // 检查用户名是否已存在
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existing) {
        throw new Error('用户名已存在，请换个名字');
      }

      // 生成 UUID 并创建新用户
      const newUserId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          username,
          role: 'student',
        })
        .select()
        .single();

      if (error) {
        // 如果是唯一约束冲突（用户名已存在）
        if (error.code === '23505') {
          throw new Error('用户名已存在，请换个名字');
        }
        throw error;
      }

      localStorage.setItem('dobby_username', username);
      setUsername(username);
      setUser({
        id: data.id as string,
        username: data.username as string,
        role: 'student',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    localStorage.removeItem('dobby_username');
    setUser(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ user, username, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
