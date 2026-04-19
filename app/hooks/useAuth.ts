"use client";

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { User } from '../services/types';

interface UseAuthReturn {
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get current user:', error);
      } finally {
        setIsAuthReady(true);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setAuthError('');
      const user = await authService.login(username, password);
      setUser(user);
      setShowLoginModal(false);
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
      throw error;
    }
  }, []);

  const register = useCallback(async (username: string, password: string, confirmPassword: string) => {
    try {
      setAuthError('');
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const user = await authService.register(username, password);
      setUser(user);
      setShowRegisterModal(false);
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed');
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
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
