"use client";

import { useState, useCallback } from 'react';
import { error } from '../lib/console';
import { User } from '../services/types';
import { useAuthInit } from './useAuthInit';
import { useAuthActions } from './useAuthActions';

// 使用 Supabase 认证（服务端 API）
const USE_SUPABASE_AUTH = true;

export interface UseAuthReturn {
  user: User | null;
  isGuest: boolean;
  isAuthReady: boolean;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  authError: string;
  login: (username: string, password: string) => Promise<void>;
  childLogin: (childId: string, pin: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string, phone?: string, realName?: string) => Promise<void>;
  autoRegister: () => Promise<void>;
  logout: () => void;
  setShowLoginModal: (show: boolean) => void;
  setShowRegisterModal: (show: boolean) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authError, setAuthError] = useState('');

  // 初始化鉴权
  useAuthInit({ setUser, setIsGuest, setIsAuthReady });

  // 鉴权操作
  const actions = useAuthActions({
    setUser, setIsGuest, setShowLoginModal, setShowRegisterModal, setAuthError,
    useSupabaseAuth: USE_SUPABASE_AUTH,
  });

  const logout = useCallback(() => {
    actions.logout();
    setUser(null);
    setIsGuest(true);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  }, [actions]);

  const autoRegister = useCallback(async () => {
    try {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('dobi_guest_id', guestId);

      const guestUser: User = {
        id: guestId,
        username: `访客${guestId.substr(-4)}`,
        role: 'child',
        displayName: `访客${guestId.substr(-4)}`,
        grade: '0',
        email: '',
        points: 0,
        level: '1',
        treeGrowth: 0,
        dailyTasks: [],
        createdAt: new Date().toISOString(),
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
    login: actions.login,
    childLogin: actions.childLogin,
    register: actions.register,
    autoRegister,
    logout,
    setShowLoginModal,
    setShowRegisterModal,
  };
}
