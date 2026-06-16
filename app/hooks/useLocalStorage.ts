"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { error, log } from '../lib/console';
import { getStorage, setStorage, removeStorage, StorageOptions } from '../lib/storage';

export interface UseLocalStorageOptions<T> extends StorageOptions {
  /** 存储键名（不含前缀） */
  key: string;
  /** 默认值 */
  defaultValue: T;
  /** 是否启用（默认 true），SSR 时可禁用 */
  enabled?: boolean;
  /** 值变化时的回调 */
  onChange?: (value: T) => void;
}

/**
 * useLocalStorage Hook
 * 
 * 类型安全的 LocalStorage 状态管理，类似 useState 但自动持久化。
 * 基于统一存储封装，支持 TTL、错误处理、批量操作。
 * 
 * @example
 * ```tsx
 * // 基本用法
 * const [courses, setCourses] = useLocalStorage({
 *   key: StorageKeys.COURSES,
 *   defaultValue: [],
 * });
 * 
 * // 带 TTL（1 小时过期）
 * const [token, setToken] = useLocalStorage({
 *   key: StorageKeys.USER_TOKEN,
 *   defaultValue: null,
 *   ttl: 3600 * 1000,
 * });
 * 
 * // 带回调
 * const [settings, setSettings] = useLocalStorage({
 *   key: StorageKeys.SETTINGS,
 *   defaultValue: { darkMode: false },
 *   onChange: (val) => log('设置已更新', val),
 * });
 * ```
 */
export function useLocalStorage<T>(options: UseLocalStorageOptions<T>) {
  const {
    key,
    defaultValue,
    enabled = true,
    onChange,
    prefix,
    ttl,
  } = options;

  const storageOptions: StorageOptions = { prefix, ttl };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 初始化：从存储读取，失败则用默认值
  const [value, setValue] = useState<T>(() => {
    if (!enabled) return defaultValue;
    
    try {
      const stored = getStorage<T>(key, null, storageOptions);
      return stored !== null ? stored : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // 值变化时写入存储
  useEffect(() => {
    if (!enabled) return;
    
    try {
      setStorage(key, value, storageOptions);
    } catch (err) {
      error(`[useLocalStorage] Failed to save "${key}":`, err);
    }
    
    onChangeRef.current?.(value);
  }, [key, value, enabled, prefix, ttl]);

  // 更新函数：支持函数式更新（类似 setState）
  const setStoredValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue(prev => {
        const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater;
        return next;
      });
    },
    []
  );

  // 清除当前键
  const remove = useCallback(() => {
    try {
      removeStorage(key, { prefix, ttl });
      setValue(defaultValue);
    } catch (error) {
      error(`[useLocalStorage] Failed to remove "${key}":`, error);
    }
  }, [key, defaultValue, prefix, ttl]);

  return [value, setStoredValue, remove] as const;
}

export default useLocalStorage;
