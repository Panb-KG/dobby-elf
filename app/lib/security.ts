/**
 * 安全工具
 * 
 * 功能：
 * - XSS 防护
 * - 输入验证
 * - SQL 注入防护
 * - 速率限制
 */

/**
 * XSS 防护 - 转义 HTML 特殊字符
 * 
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * 清理 HTML 标签
 * 
 * @param str 要清理的字符串
 * @returns 清理后的字符串
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * SQL 注入防护 - 转义 SQL 特殊字符
 * 
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeSql(str: string): string {
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\0/g, '\\0');
}

/**
 * 输入验证 - 验证用户 ID 格式
 * 
 * @param id 用户 ID
 * @returns 是否有效
 */
export function isValidUserId(id: string): boolean {
  return /^user_[a-zA-Z0-9_]+$/.test(id);
}

/**
 * 输入验证 - 验证课程 ID 格式
 * 
 * @param id 课程 ID
 * @returns 是否有效
 */
export function isValidCourseId(id: string): boolean {
  return /^course_[a-zA-Z0-9_]+$/.test(id);
}

/**
 * 输入验证 - 验证作业 ID 格式
 * 
 * @param id 作业 ID
 * @returns 是否有效
 */
export function isValidHomeworkId(id: string): boolean {
  return /^hw_[a-zA-Z0-9_]+$/.test(id);
}

/**
 * 输入验证 - 验证日期格式 (YYYY-MM-DD)
 * 
 * @param date 日期字符串
 * @returns 是否有效
 */
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

/**
 * 输入验证 - 验证邮箱格式
 * 
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 输入验证 - 验证字符串长度
 * 
 * @param str 要验证的字符串
 * @param min 最小长度
 * @param max 最大长度
 * @returns 是否有效
 */
export function isValidLength(str: string, min: number = 1, max: number = 1000): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * 速率限制器
 * 
 * @param maxRequests 最大请求数
 * @param windowMs 时间窗口（毫秒）
 * @returns 速率限制器函数
 */
export function createRateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, number[]>();
  
  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const userRequests = requests.get(key) || [];
    
    // 清理过期记录
    const validRequests = userRequests.filter((time) => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return true; // 超过限制
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    
    return false; // 未超过限制
  };
}

/**
 * API 速率限制器（默认配置）
 */
export const apiRateLimiter = createRateLimiter(100, 60000); // 每分钟 100 次请求

/**
 * 内容安全策略头
 * 
 * @returns CSP 头配置
 */
export function getCSPHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
}

/**
 * 安全头配置
 * 
 * @returns 安全头对象
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...getCSPHeaders(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

export default {
  escapeHtml,
  stripHtml,
  escapeSql,
  isValidUserId,
  isValidCourseId,
  isValidHomeworkId,
  isValidDate,
  isValidEmail,
  isValidLength,
  createRateLimiter,
  apiRateLimiter,
  getCSPHeaders,
  getSecurityHeaders,
};
