"use client";

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { error } from '../lib/console';
import { User } from '../services/types';

export interface UseAuthReturn {
  user: User | null;
  isAuthReady: boolean;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  authError: string;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  setShowLoginModal: (show: boolean) => void;
  setShowRegisterModal: (show: boolean) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true); // 默认显示登录
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        error('Failed to get current user:', error);
      } finally {
        setIsAuthReady(true);
      }
    };

    initAuth();

    // 监听认证状态变化
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setAuthError('');
    const user = await authService.login(username, password);
    setUser(user);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  }, []);

  const register = useCallback(async (username: string, password: string, confirmPassword: string) => {
    setAuthError('');

    if (password !== confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }

    if (password.length < 4) {
      throw new Error('密码长度至少4位');
    }

    if (username.length < 2) {
      throw new Error('用户名长度至少2位');
    }

    const user = await authService.register(username, password);
    setUser(user);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
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
    register,
    logout,
    setShowLoginModal,
    setShowRegisterModal,
  };
}
