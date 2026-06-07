/**
 * 系统日志工具 - 控制台版本（已迁移到 Supabase，日志暂不持久化）
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCategory = 'system' | 'api' | 'auth' | 'ai' | 'database' | 'user';

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, unknown>;
}

const SUPABASE_LOGS_TABLE = 'system_logs'; // 预留：将来可写入 Supabase

/**
 * 记录系统日志（控制台输出）
 */
export function logSystem(entry: LogEntry): string {
  const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;

  if (entry.level === 'error') {
    console.error(prefix, entry.message, entry.details || '');
  } else if (entry.level === 'warn') {
    console.warn(prefix, entry.message, entry.details || '');
  } else {
    console.log(prefix, entry.message, entry.details || '');
  }

  return logId;
}

/**
 * 记录 API 使用（控制台输出）
 */
export function logApiUsage(
  endpoint: string,
  method: string,
  userId: string | null,
  statusCode: number,
  durationMs: number,
  tokensUsed: number = 0
): void {
  console.log(
    `[API] ${method} ${endpoint} | status=${statusCode} | ${durationMs}ms | uid=${userId || 'anon'}`
  );
}

/**
 * 手动刷新（兼容旧接口，无操作）
 */
export async function flushLogs(): Promise<void> {
  // 预留：将来可批量写入 Supabase
}

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
