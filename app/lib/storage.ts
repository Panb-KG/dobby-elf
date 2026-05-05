import { error as logError } from './console';
/**
 * 统一存储封装
 * 
 * 提供类型安全的 LocalStorage 操作，支持：
 * - 自动序列化/反序列化
 * - 错误处理
 * - 键名管理
 * - 批量操作
 * - SSR 安全（浏览器环境检测）
 */

const STORAGE_PREFIX = 'dobi_';

/** 检测是否在浏览器环境 */
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/** 存储选项 */
export interface StorageOptions {
  prefix?: string;
  ttl?: number; // 过期时间（毫秒）
}

/**
 * 存储键名管理
 */
export const StorageKeys = {
  // 用户
  USER: 'user',
  USER_TOKEN: 'user_token',
  
  // 课程
  COURSES: 'courses',
  
  // 作业
  HOMEWORK: 'homework',
  
  // 成就
  ACHIEVEMENTS: 'achievements',
  POINTS: 'points',
  
  // 专注
  FOCUS_SESSIONS: 'focus_sessions',
  
  // 聊天
  CHAT_HISTORY: 'chat_history',
  
  // 设置
  SETTINGS: 'settings',
} as const;

/**
 * 生成完整键名
 */
function getFullKey(key: string, prefix: string = STORAGE_PREFIX): string {
  return `${prefix}${key}`;
}

/**
 * 设置存储项
 */
export function setStorage<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): void {
  if (!isBrowser) return;
  try {
    const fullKey = getFullKey(key, options.prefix);
    const data: any = {
      value,
      timestamp: Date.now(),
    };
    
    if (options.ttl) {
      data.expiry = Date.now() + options.ttl;
    }
    
    localStorage.setItem(fullKey, JSON.stringify(data));
  } catch (err) {
    logError(`Failed to set storage key "${key}":`, err);
    // 存储满时清理过期数据
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      cleanupExpired();
    }
  }
}

/**
 * 获取存储项
 */
export function getStorage<T>(
  key: string,
  defaultValue: T | null = null,
  options: StorageOptions = {}
): T | null {
  if (!isBrowser) return defaultValue;
  try {
    const fullKey = getFullKey(key, options.prefix);
    const item = localStorage.getItem(fullKey);
    
    if (item === null) {
      return defaultValue;
    }
    
    const data = JSON.parse(item);
    
    // 检查是否过期
    if (data.expiry && Date.now() > data.expiry) {
      removeStorage(key, options);
      return defaultValue;
    }
    
    return data.value as T;
  } catch (err) {
    logError(`Failed to get storage key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * 移除存储项
 */
export function removeStorage(
  key: string,
  options: StorageOptions = {}
): void {
  if (!isBrowser) return;
  try {
    const fullKey = getFullKey(key, options.prefix);
    localStorage.removeItem(fullKey);
  } catch (err) {
    logError(`Failed to remove storage key "${key}":`, err);
  }
}

/**
 * 清空所有存储
 */
export function clearStorage(prefix: string = STORAGE_PREFIX): void {
  if (!isBrowser) return;
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    logError('Failed to clear storage:', err);
  }
}

/**
 * 检查键是否存在
 */
export function hasStorage(key: string, prefix: string = STORAGE_PREFIX): boolean {
  if (!isBrowser) return false;
  const fullKey = getFullKey(key, prefix);
  return localStorage.getItem(fullKey) !== null;
}

/**
 * 获取所有键
 */
export function getAllKeys(prefix: string = STORAGE_PREFIX): string[] {
  if (!isBrowser) return [];
  return Object.keys(localStorage).filter(key => key.startsWith(prefix));
}

/**
 * 清理过期数据
 */
function cleanupExpired(): void {
  if (!isBrowser) return;
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const data = JSON.parse(item);
          if (data.expiry && Date.now() > data.expiry) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // 忽略解析错误
      }
    });
  } catch (err) {
    logError('Failed to cleanup expired storage:', err);
  }
}

/**
 * 导出所有数据为 JSON
 */
export function exportStorage(prefix: string = STORAGE_PREFIX): string {
  if (!isBrowser) return '{}';
  const data: Record<string, any> = {};
  const keys = getAllKeys(prefix);
  
  keys.forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      const cleanKey = key.replace(prefix, '');
      data[cleanKey] = JSON.parse(item);
    }
  });
  
  return JSON.stringify(data, null, 2);
}

/**
 * 从 JSON 导入数据
 */
export function importStorage(jsonData: string, prefix: string = STORAGE_PREFIX): void {
  if (!isBrowser) return;
  try {
    const data = JSON.parse(jsonData);
    
    Object.entries(data).forEach(([key, value]) => {
      const fullKey = getFullKey(key, prefix);
      localStorage.setItem(fullKey, JSON.stringify(value));
    });
  } catch (err) {
    logError('Failed to import storage:', err);
    throw new Error('导入数据失败，请检查文件格式');
  }
}

/**
 * 获取存储使用情况
 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  if (!isBrowser) return { used: 0, total: 0, percentage: 0 };
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key!);
    if (value) {
      total += key!.length + value.length;
    }
  }
  
  // 估算总容量（通常 5-10MB）
  const estimatedTotal = 5 * 1024 * 1024; // 5MB
  const used = total * 2; // UTF-16 编码
  
  return {
    used,
    total: estimatedTotal,
    percentage: (used / estimatedTotal) * 100,
  };
}
