"use client";

import { useState, useEffect, useCallback } from 'react';
import { error } from '../lib/console';
import { User } from '../services/types';

// 使用 Supabase 认证（服务端 API）
const USE_SUPABASE_AUTH = true;

export interface UseAuthReturn {
  user: User | null;
  isGuest: boolean; // 是否为访客
  isAuthReady: boolean;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  authError: string;
  login: (username: string, password: string) => Promise<void>;
  childLogin: (childId: string, pin: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string, phone?: string, realName?: string) => Promise<void>;
  autoRegister: () => Promise<void>; // 自动注册为访客
  logout: () => void;
  setShowLoginModal: (show: boolean) => void;
  setShowRegisterModal: (show: boolean) => void;
}

const AUTH_TOKEN_KEY = 'dobi_auth_token';
const USER_DATA_KEY = 'dobi_user_data';
const GUEST_ID_KEY = 'dobi_guest_id';

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false); // 访客标识
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // 默认不显示登录弹窗
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
                setIsGuest(false);
              } else if (response.status === 401) {
                // Token 已过期，但保留本地用户数据作为离线模式
                console.log('[Auth] Token expired, using offline mode');
                setUser(parsed);
                setIsGuest(false);
              } else {
                // 其他错误（5xx等），使用本地缓存
                setUser(parsed);
                setIsGuest(false);
              }
            } catch (networkError) {
              // 网络错误，仍然使用本地缓存（离线模式）
              console.log('[Auth] Network error, using cached user:', networkError);
              setUser(parsed);
              setIsGuest(false);
            }
          } else {
            setUser(parsed);
            setIsGuest(false);
          }
        } else {
          // 没有登录信息，标记为访客
          console.log('[Auth] No auth found, guest mode');
          setIsGuest(true);
        }
      } catch (err) {
        error('Failed to restore auth:', err);
        // 出错也允许访客模式
        setIsGuest(true);
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
        const loggedInUser = await authService.login(username, password);
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

  const register = useCallback(async (username: string, password: string, _confirmPassword: string, phone?: string, realName?: string) => {
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
          body: JSON.stringify({ action: 'register_parent', username: username.trim(), password, phone, realName }),
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
    setIsGuest(true); // 登出后变为访客
    setShowLoginModal(false); // 不强制显示登录弹窗
    setShowRegisterModal(false);
  }, []);

  // 自动注册为访客（生成一个临时用户ID）
  const autoRegister = useCallback(async () => {
    try {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(GUEST_ID_KEY, guestId);
      
      // 创建一个临时访客用户对象
      const guestUser: User = {
        id: guestId,
        username: `访客${guestId.substr(-4)}`,
        role: 'student',
        grade: 0,
        displayName: `访客${guestId.substr(-4)}`,
        points: 0,
        level: '1',
        treeGrowth: 0,
        dailyTasks: [],
      };
      
      setUser(guestUser);
      setIsGuest(false);
      console.log('[Auth] Auto-registered as guest:', guestId);
    } catch (err) {
      error('Failed to auto-register:', err);
    }
  }, []);

  return {
    user,
    isGuest,
    isAuthReady,
    showLoginModal,
    showRegisterModal,
    authError,
    login,
    childLogin,
    register,
    autoRegister,
    logout,
    setShowLoginModal,
    setShowRegisterModal,
  };
}
