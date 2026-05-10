/**
 * 错误监控（Sentry 集成）
 * 
 * 生产环境自动上报错误到 Sentry
 * 开发环境仅 console.error
 * 
 * 使用方式：
 * 1. 设置环境变量 SENTRY_DSN 和 SENTRY_ENVIRONMENT
 * 2. 在错误捕获处调用 captureError()
 * 3. 可选：在 API 路由中使用 withSentry() 包装
 */

// Sentry DSN（从环境变量读取）
const SENTRY_DSN = process.env.SENTRY_DSN || '';
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';
const IS_ENABLED = !!SENTRY_DSN && process.env.NODE_ENV === 'production';

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
 * 捕获错误（生产环境上报 Sentry，开发环境仅日志）
 */
export function captureError(error: unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorObj = error instanceof Error ? error : new Error(String(error));

  if (IS_ENABLED) {
    // 动态导入 Sentry（避免开发环境增加 bundle）
    import('@sentry/node').then(({ captureException, setContext, setTag, setUser }) => {
      // 设置上下文
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          setTag(key, value);
        });
      }
      if (context?.extra) {
        setContext('extra', context.extra);
      }
      if (context?.user) {
        setUser(context.user);
      }

      captureException(errorObj);
    }).catch(() => {
      // Sentry 导入失败，降级到 console
      console.error('[Sentry] Failed to report error:', errorMessage);
    });
  } else {
    // 开发环境：仅 console
    const prefix = context?.tags?.route ? `[${context.tags.route}]` : '';
    console.error(`[Error Monitoring] ${prefix} ${errorMessage}`, context?.extra || '');
  }
}

/**
 * 捕获消息（非错误级别的事件）
 */
export function captureMessage(message: string, level: ErrorContext['level'] = 'info', tags?: Record<string, string>): void {
  if (IS_ENABLED) {
    import('@sentry/node').then(({ captureMessage: sentryCaptureMessage }) => {
      sentryCaptureMessage(message, { tags });
    }).catch(() => {});
  } else {
    console.log(`[Message ${level}] ${message}`, tags || '');
  }
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
 * 检查 Sentry 是否已启用
 */
export function isSentryEnabled(): boolean {
  return IS_ENABLED;
}
