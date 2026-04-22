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
 * - 番茄钟计时器
 * - 白噪音播放
 * - 专注历史记录
 * - 自动保存会话
 * 
 * @example
 * ```tsx
 * const { isFocusing, elapsedTime, startFocus, pauseFocus } = useFocus();
 * 
 * // 开始 25 分钟专注
 * startFocus(25);
 * 
 * // 暂停
 * pauseFocus();
 * 
 * // 恢复
 * resumeFocus();
 * ```
 */
export function useFocus(options: UseFocusOptions = {}): UseFocusReturn {
  const { defaultDuration = 25, autoSave = true } = options;
  
  const [isFocusing, setIsFocusing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
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

  // 定时器
  useEffect(() => {
    if (isFocusing) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            // 时间到，自动完成
            completeSession();
            return duration;
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
  }, [isFocusing, duration]);

  const startFocus = useCallback((durationMinutes: number) => {
    setDuration(durationMinutes * 60);
    setElapsedTime(0);
    setIsFocusing(true);
    startTimeRef.current = Date.now();
  }, []);

  const pauseFocus = useCallback(() => {
    setIsFocusing(false);
    startTimeRef.current = null;
  }, []);

  const resumeFocus = useCallback(() => {
    if (elapsedTime < duration) {
      setIsFocusing(true);
      startTimeRef.current = Date.now();
    }
  }, [elapsedTime, duration]);

  const stopFocus = useCallback(() => {
    setIsFocusing(false);
    setElapsedTime(0);
    startTimeRef.current = null;
  }, []);

  const completeSession = useCallback(() => {
    const session: FocusSession = {
      id: `focus_${Date.now()}`,
      startTime: new Date(startTimeRef.current || Date.now()).toISOString(),
      duration: elapsedTime,
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
  }, [elapsedTime, whiteNoise, autoSave]);

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
    setWhiteNoise,
    completeSession,
  };
}
