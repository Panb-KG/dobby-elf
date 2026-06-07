'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * 小学生友好认证 Context
 * 
 * 认证方式：
 * 1. 用户名登录（无需邮箱）
 * 2. 可选4位PIN（家长可设置）
 * 3. 首次使用自动创建账号
 */

interface AuthContextType {
  user: User | null;
  username: string | null;
  isLoading: boolean;
  login: (username: string, pin?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, pin?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储是否有已登录用户
    const storedUsername = localStorage.getItem('dobby_username');
    if (storedUsername) {
      setUsername(storedUsername);
      // 使用用户名作为标识（简化版，生产环境需要更安全的方案）
      loadUser(storedUsername);
    }
    setIsLoading(false);
  }, []);

  async function loadUser(username: string) {
    const supabase = getSupabaseBrowserClient();
    // 查找或创建用户
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      // 用户不存在，需要注册
      setUser(null);
      return;
    }

    // 模拟用户对象（简化版）
    setUser({
      id: data.id,
      email: null,
      // ... 其他 User 属性
    } as User);
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
      setUser({ id: data.id, email: null } as User);
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

      // 创建新用户（使用 Supabase Auth 的匿名登录或自定义用户表）
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          username,
          // TODO: 加密存储PIN
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('dobby_username', username);
      setUsername(username);
      setUser({ id: data.id, email: null } as User);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
