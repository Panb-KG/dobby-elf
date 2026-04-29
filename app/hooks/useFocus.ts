"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { getStorage, setStorage } from '../lib/storage';
import { StorageKeys } from '../lib/storage';
import type { FocusSession, WhiteNoiseType } from '../types';

export interface UseFocusReturn {
  isFocusing: boolean;
  elapsedTime: number;
  duration: number;
  whiteNoise: WhiteNoiseType;
  sessions: FocusSession[];
  startFocus: (durationMinutes: number) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  stopFocus: () => void;
  setWhiteNoise: (type: WhiteNoiseType) => void;
  completeSession: () => void;
}

export interface UseFocusOptions {
  defaultDuration?: number; // minutes
  autoSave?: boolean;
}

/**
 * 专注模式 Hook
 * 
 * 功能：
 * - 番茄钟计时器（倒计时）
 * - 白噪音播放
 * - 专注历史记录
 * - 自动保存会话
 */
export function useFocus(options: UseFocusOptions = {}): UseFocusReturn {
  const { defaultDuration = 25, autoSave = true } = options;
  
  const [isFocusing, setIsFocusing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds remaining
  const [duration, setDuration] = useState(defaultDuration * 60); // seconds
  const [whiteNoise, setWhiteNoise] = useState<WhiteNoiseType>('none');
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 保存会话到本地存储
  useEffect(() => {
    if (autoSave) {
      const saved = getStorage<FocusSession[]>(StorageKeys.FOCUS_SESSIONS, []);
      if (saved && saved.length > 0) {
        setSessions(saved);
      }
    }
  }, [autoSave]);

  // completeSession 必须在 useEffect 之前定义
  const completeSession = useCallback(() => {
    const session: FocusSession = {
      id: `focus_${Date.now()}`,
      startTime: new Date(startTimeRef.current || Date.now()).toISOString(),
      duration: duration - elapsedTime, // actual focused time
      completed: true,
      whiteNoise,
    };

    setSessions(prev => {
      const updated = [session, ...prev];
      if (autoSave) {
        setStorage(StorageKeys.FOCUS_SESSIONS, updated);
      }
      return updated;
    });

    setIsFocusing(false);
    setElapsedTime(0);
    startTimeRef.current = null;
  }, [duration, elapsedTime, whiteNoise, autoSave]);

  // 定时器 - 倒计时模式
  useEffect(() => {
    if (isFocusing) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // 时间到，自动完成
            setTimeout(() => completeSession(), 0);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isFocusing, duration, completeSession]);

  const startFocus = useCallback((durationMinutes: number) => {
    const seconds = durationMinutes * 60;
    setDuration(seconds);
    setElapsedTime(seconds);
    setIsFocusing(true);
    startTimeRef.current = Date.now();
  }, []);

  const pauseFocus = useCallback(() => {
    setIsFocusing(false);
    startTimeRef.current = null;
  }, []);

  const resumeFocus = useCallback(() => {
    if (elapsedTime > 0) {
      setIsFocusing(true);
      startTimeRef.current = Date.now();
    }
  }, [elapsedTime]);

  const stopFocus = useCallback(() => {
    setIsFocusing(false);
    setElapsedTime(duration);
    startTimeRef.current = null;
  }, [duration]);

  const setWhiteNoiseCallback = useCallback((type: WhiteNoiseType) => {
    setWhiteNoise(type);
  }, []);

  return {
    isFocusing,
    elapsedTime,
    duration,
    whiteNoise,
    sessions,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    setWhiteNoise: setWhiteNoiseCallback,
    completeSession,
  };
}
