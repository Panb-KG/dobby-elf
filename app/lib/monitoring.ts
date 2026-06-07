/**
 * 错误监控（控制台日志版本）
 * 
 * 生产环境和开发环境都使用控制台日志
 * 如果需要 Sentry 集成，请安装 @sentry/node 并修改此文件
 * 
 * 使用方式：
 * 1. 在错误捕获处调用 captureError()
 * 2. 可选：在 API 路由中使用 withSentry() 包装
 */

/**
 * 错误信息接口
 */
export interface ErrorContext {
  message?: string;
  level?: 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; username?: string; email?: string };
}

/**
 * 捕获错误（控制台日志）
 */
export function captureError(error: unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // 构建日志前缀
  const prefix = context?.tags?.route ? `[${context.tags.route}]` : '[Error Monitoring]';
  
  // 控制台输出
  console.error(`${prefix} ${errorMessage}`, {
    extra: context?.extra || {},
    user: context?.user || {},
    stack: error instanceof Error ? error.stack : undefined,
  });
}

/**
 * 捕获消息（非错误级别的事件）
 */
export function captureMessage(message: string, level: ErrorContext['level'] = 'info', tags?: Record<string, string>): void {
  const logMethod = level === 'info' ? console.log : 
                   level === 'warning' ? console.warn : 
                   console.error;
  
  logMethod(`[Message ${level}] ${message}`, tags || {});
}

/**
 * API 路由错误包装器
 * 自动捕获并上报 API 路由中的错误
 */
export function withSentry<T>(
  handler: () => T | Promise<T>,
  context?: ErrorContext
): Promise<T> {
  return Promise.resolve(handler()).catch((error) => {
    captureError(error, context);
    throw error;
  });
}

/**
 * 检查监控是否已启用（兼容接口）
 */
export function isSentryEnabled(): boolean {
  return false;
}
