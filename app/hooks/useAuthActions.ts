/**
 * 鉴权操作（登录、注册、登出）
 */

"use client";

import { useCallback } from 'react';
import { User } from '../services/types';

const AUTH_TOKEN_KEY = 'dobi_auth_token';
const USER_DATA_KEY = 'dobi_user_data';

interface UseAuthActionsOptions {
  setUser: (user: User | null) => void;
  setIsGuest: (isGuest: boolean) => void;
  setShowLoginModal: (show: boolean) => void;
  setShowRegisterModal: (show: boolean) => void;
  setAuthError: (error: string) => void;
  useSupabaseAuth: boolean;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  childLogin: (childId: string, pin: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    confirmPassword: string,
    phone?: string,
    realName?: string
  ) => Promise<void>;
  logout: () => void;
}

export function useAuthActions({
  setUser,
  setIsGuest,
  setShowLoginModal,
  setShowRegisterModal,
  setAuthError,
  useSupabaseAuth,
}: UseAuthActionsOptions): AuthActions {
  const login = useCallback(
    async (username: string, password: string) => {
      setAuthError('');
      try {
        if (useSupabaseAuth) {
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
    },
    [useSupabaseAuth, setUser, setShowLoginModal, setShowRegisterModal, setAuthError]
  );

  const childLogin = useCallback(
    async (childId: string, pin: string) => {
      setAuthError('');
      try {
        if (useSupabaseAuth) {
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
    },
    [useSupabaseAuth, setUser, setShowLoginModal, setShowRegisterModal, setAuthError]
  );

  const register = useCallback(
    async (
      username: string,
      password: string,
      _confirmPassword: string,
      phone?: string,
      realName?: string
    ) => {
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
        if (useSupabaseAuth) {
          const response = await fetch('/api/auth-sb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'register_parent',
              username: username.trim(),
              password,
              phone,
              realName,
            }),
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
    },
    [useSupabaseAuth, setUser, setShowLoginModal, setShowRegisterModal, setAuthError]
  );

  const logout = useCallback(() => {
    if (useSupabaseAuth) {
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      import('../services/auth').then(({ authService }) => authService.logout());
    }
    setUser(null);
    setIsGuest(true);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  }, [useSupabaseAuth, setUser, setIsGuest, setShowLoginModal, setShowRegisterModal]);

  return { login, childLogin, register, logout };
}
