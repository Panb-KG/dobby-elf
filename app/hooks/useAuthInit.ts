/**
 * 鉴权初始化逻辑
 * 从 localStorage 恢复用户状态，验证 token 有效性
 */

"use client";

import { useEffect } from 'react';
import { User } from '../services/types';
import { error } from '../lib/console';

const AUTH_TOKEN_KEY = 'dobi_auth_token';
const USER_DATA_KEY = 'dobi_user_data';

interface UseAuthInitOptions {
  setUser: (user: User | null) => void;
  setIsGuest: (isGuest: boolean) => void;
  setIsAuthReady: (ready: boolean) => void;
}

async function restoreOrAutoLogin(
  setUser: (user: User | null) => void,
  setIsGuest: (isGuest: boolean) => void
): Promise<void> {
  const userData = localStorage.getItem(USER_DATA_KEY);
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (userData && token) {
    const parsed: User = JSON.parse(userData);

    // 验证 token 是否仍然有效
    try {
      const response = await fetch('/api/auth-sb?action=me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsGuest(false);
        return;
      }

      // Token 过期，尝试自动重新登录
      const autoRes = await fetch('/api/auth-sb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_login' }),
      });
      if (autoRes.ok) {
        const autoData = await autoRes.json();
        setUser(autoData.user);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(autoData.user));
        localStorage.setItem(AUTH_TOKEN_KEY, autoData.token);
        setIsGuest(false);
        return;
      }

      setUser(parsed);
      setIsGuest(false);
    } catch {
      // 网络错误，使用本地缓存
      setUser(parsed);
      setIsGuest(false);
    }
  } else {
    // 没有登录信息，尝试自动登录
    try {
      const autoRes = await fetch('/api/auth-sb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_login' }),
      });
      if (autoRes.ok) {
        const autoData = await autoRes.json();
        setUser(autoData.user);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(autoData.user));
        localStorage.setItem(AUTH_TOKEN_KEY, autoData.token);
        setIsGuest(false);
      } else {
        setIsGuest(true);
      }
    } catch {
      setIsGuest(true);
    }
  }
}

export function useAuthInit({ setUser, setIsGuest, setIsAuthReady }: UseAuthInitOptions) {
  useEffect(() => {
    restoreOrAutoLogin(setUser, setIsGuest).finally(() => {
      setIsAuthReady(true);
    });
  }, [setUser, setIsGuest, setIsAuthReady]);
}
