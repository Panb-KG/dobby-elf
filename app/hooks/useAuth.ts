"use client";

import { useState, useEffect, useCallback } from 'react';
import { error } from '../lib/console';
import { User } from '../services/types';

// 使用 Supabase 认证（服务端 API）
const USE_SUPABASE_AUTH = true;

export interface UseAuthReturn {
  user: User | null;
  isAuthReady: boolean;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  authError: string;
  login: (username: string, password: string) => Promise<void>;
  childLogin: (childId: string, pin: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  setShowLoginModal: (show: boolean) => void;
  setShowRegisterModal: (show: boolean) => void;
}

const AUTH_TOKEN_KEY = 'dobi_auth_token';
const USER_DATA_KEY = 'dobi_user_data';

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 尝试从 localStorage 恢复用户
        const userData = localStorage.getItem(USER_DATA_KEY);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        
        if (userData && token) {
          const parsed = JSON.parse(userData);
          
          if (USE_SUPABASE_AUTH) {
            // 验证 token 是否仍然有效
            try {
              const response = await fetch('/api/auth-sb?action=me', {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (response.ok) {
                const data = await response.json();
                setUser(data.user);
              } else {
                // Token 过期，清除本地数据
                localStorage.removeItem(USER_DATA_KEY);
                localStorage.removeItem(AUTH_TOKEN_KEY);
              }
            } catch {
              // 网络错误，仍然使用本地缓存
              setUser(parsed);
            }
          } else {
            setUser(parsed);
          }
        }
      } catch (err) {
        error('Failed to restore auth:', err);
      } finally {
        setIsAuthReady(true);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setAuthError('');
    try {
      if (USE_SUPABASE_AUTH) {
        // Supabase 认证（带密码验证）
        const response = await fetch('/api/auth-sb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', username, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '登录失败');
        }

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      } else {
        // 旧认证（SQLite）
        const { authService } = await import('../services/auth');
        const loggedInUser = await authService.login(username, _password);
        setUser(loggedInUser);
      }
      
      setShowLoginModal(false);
      setShowRegisterModal(false);
    } catch (err: any) {
      setAuthError(err.message || '登录失败');
      throw err;
    }
  }, []);

  const childLogin = useCallback(async (childId: string, pin: string) => {
    setAuthError('');
    try {
      if (USE_SUPABASE_AUTH) {
        // 孩子 PIN 登录
        const response = await fetch('/api/auth-sb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'child_login', childId, pin }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '登录失败');
        }

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      } else {
        const { authService } = await import('../services/auth');
        const loggedInUser = await authService.childLogin(childId, pin);
        setUser(loggedInUser);
      }
      
      setShowLoginModal(false);
      setShowRegisterModal(false);
    } catch (err: any) {
      setAuthError(err.message || '登录失败');
      throw err;
    }
  }, []);

  const register = useCallback(async (username: string, password: string, _confirmPassword: string) => {
    setAuthError('');
    
    if (username.trim().length < 2) {
      throw new Error('用户名长度至少2位');
    }
    if (password.length < 6) {
      throw new Error('密码至少需要6个字符');
    }
    if (password !== _confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }

    try {
      if (USE_SUPABASE_AUTH) {
        // 家长注册（带密码，通过服务端 Admin API 创建已确认用户）
        const response = await fetch('/api/auth-sb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register_parent', username: username.trim(), password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '注册失败');
        }

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      } else {
        // 旧注册（SQLite）
        const { authService } = await import('../services/auth');
        const registeredUser = await authService.register(username, password);
        setUser(registeredUser);
      }
      
      setShowLoginModal(false);
      setShowRegisterModal(false);
    } catch (err: any) {
      setAuthError(err.message || '注册失败');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    if (USE_SUPABASE_AUTH) {
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      import('../services/auth').then(({ authService }) => authService.logout());
    }
    setUser(null);
    setShowLoginModal(true);
    setShowRegisterModal(false);
  }, []);

  return {
    user,
    isAuthReady,
    showLoginModal,
    showRegisterModal,
    authError,
    login,
    childLogin,
    register,
    logout,
    setShowLoginModal,
    setShowRegisterModal,
  };
}
