/**
 * 系统日志工具 - 异步队列版本
 * 
 * 日志写入使用队列异步执行，避免阻塞 API 响应
 */

import { getDb } from '../lib/db';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCategory = 'system' | 'api' | 'auth' | 'ai' | 'database' | 'user';

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, unknown>;
}

// ===== 异步队列 =====

interface QueueItem {
  type: 'system_log' | 'api_usage';
  data: unknown;
}

const queue: QueueItem[] = [];
let processing = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const FLUSH_INTERVAL = 1000; // 1秒刷新一次
const MAX_QUEUE_SIZE = 100; // 队列满时立即刷新

/**
 * 刷新队列，批量写入数据库
 */
async function flushQueue(): Promise<void> {
  if (processing || queue.length === 0) return;
  
  processing = true;
  const items = queue.splice(0);
  
  try {
    const db = getDb();
    
    // 批量写入 system_logs
    const systemLogs = items.filter(i => i.type === 'system_log');
    if (systemLogs.length > 0) {
      const insertLog = db.prepare(
        'INSERT INTO system_logs (id, level, category, message, details) VALUES (?, ?, ?, ?, ?)'
      );
      const insertMany = db.transaction((logs: QueueItem[]) => {
        for (const item of logs) {
          const entry = item.data as LogEntry & { id: string };
          insertLog.run(
            entry.id,
            entry.level,
            entry.category,
            entry.message,
            entry.details ? JSON.stringify(entry.details) : null
          );
        }
      });
      insertMany(systemLogs);
    }
    
    // 批量写入 api_usage
    const apiLogs = items.filter(i => i.type === 'api_usage');
    if (apiLogs.length > 0) {
      const insertUsage = db.prepare(
        'INSERT INTO api_usage (id, endpoint, method, user_id, status_code, duration_ms, tokens_used) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      const insertMany = db.transaction((logs: QueueItem[]) => {
        for (const item of logs) {
          const data = item.data as { id: string; endpoint: string; method: string; userId: string | null; statusCode: number; durationMs: number; tokensUsed: number };
          insertUsage.run(
            data.id, data.endpoint, data.method, data.userId,
            data.statusCode, data.durationMs, data.tokensUsed
          );
        }
      });
      insertMany(apiLogs);
    }
  } catch (e) {
    console.error('Failed to flush log queue:', e);
    // 失败的项目重新入队（放开头）
    queue.unshift(...items);
  } finally {
    processing = false;
  }
}

/**
 * 调度刷新
 */
function scheduleFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  
  if (queue.length >= MAX_QUEUE_SIZE) {
    // 队列满，立即刷新
    flushQueue();
  } else {
    // 否则延迟刷新
    flushTimer = setTimeout(() => {
      flushQueue();
    }, FLUSH_INTERVAL);
  }
}

/**
 * 记录系统日志（异步队列）
 */
export function logSystem(entry: LogEntry): string {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // 控制台立即输出（不阻塞）
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
  if (entry.level === 'error') {
    console.error(prefix, entry.message, entry.details || '');
  } else {
    console.log(prefix, entry.message, entry.details || '');
  }
  
  // 加入异步队列
  queue.push({
    type: 'system_log',
    data: { ...entry, id: logId }
  });
  
  scheduleFlush();
  
  return logId;
}

/**
 * 记录 API 使用（异步队列）
 */
export function logApiUsage(
  endpoint: string,
  method: string,
  userId: string | null,
  statusCode: number,
  durationMs: number,
  tokensUsed: number = 0
): void {
  const id = `api_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  queue.push({
    type: 'api_usage',
    data: { id, endpoint, method, userId, statusCode, durationMs, tokensUsed }
  });
  
  scheduleFlush();
}

/**
 * 手动刷新队列（用于优雅关闭）
 */
export async function flushLogs(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  await flushQueue();
}

// 便捷方法
export const logger = {
  info: (message: string, category: LogCategory = 'system', details?: Record<string, unknown>) =>
    logSystem({ level: 'info', category, message, details }),
  warn: (message: string, category: LogCategory = 'system', details?: Record<string, unknown>) =>
    logSystem({ level: 'warn', category, message, details }),
  error: (message: string, category: LogCategory = 'system', details?: Record<string, unknown>) =>
    logSystem({ level: 'error', category, message, details }),
  debug: (message: string, category: LogCategory = 'system', details?: Record<string, unknown>) =>
    logSystem({ level: 'debug', category, message, details }),
  flush: flushLogs,
};
