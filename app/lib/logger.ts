/**
 * 系统日志工具
 * 
 * 用于记录系统事件、API 调用、错误等
 */

import { getDb } from '../lib/db';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCategory = 'system' | 'api' | 'auth' | 'ai' | 'database' | 'user';

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, any>;
}

/**
 * 记录系统日志
 */
export function logSystem(entry: LogEntry): string {
  try {
    const db = getDb();
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    db.prepare(
      'INSERT INTO system_logs (id, level, category, message, details) VALUES (?, ?, ?, ?, ?)'
    ).run(
      logId,
      entry.level,
      entry.category,
      entry.message,
      entry.details ? JSON.stringify(entry.details) : null
    );
    
    // 控制台也输出
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    if (entry.level === 'error') {
      console.error(prefix, entry.message, entry.details || '');
    } else {
      console.log(prefix, entry.message, entry.details || '');
    }
    
    return logId;
  } catch (e) {
    // 日志系统本身出错，只能 console
    console.error('Failed to write log:', e);
    return '';
  }
}

/**
 * 记录 API 使用
 */
export function logApiUsage(endpoint: string, method: string, userId: string | null, statusCode: number, durationMs: number, tokensUsed: number = 0): void {
  try {
    const db = getDb();
    const id = `api_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    db.prepare(
      'INSERT INTO api_usage (id, endpoint, method, user_id, status_code, duration_ms, tokens_used) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id, endpoint, method, userId, statusCode, durationMs, tokensUsed
    );
  } catch (e) {
    // 静默失败，不影响主流程
    console.error('Failed to log API usage:', e);
  }
}

// 便捷方法
export const logger = {
  info: (message: string, category: LogCategory = 'system', details?: Record<string, any>) =>
    logSystem({ level: 'info', category, message, details }),
  warn: (message: string, category: LogCategory = 'system', details?: Record<string, any>) =>
    logSystem({ level: 'warn', category, message, details }),
  error: (message: string, category: LogCategory = 'system', details?: Record<string, any>) =>
    logSystem({ level: 'error', category, message, details }),
  debug: (message: string, category: LogCategory = 'system', details?: Record<string, any>) =>
    logSystem({ level: 'debug', category, message, details }),
};
