/**
 * 安全获取错误消息
 * 用于 catch (err: unknown) 块中提取错误信息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
}

/**
 * 安全获取错误对象（保留原始错误用于日志）
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}
