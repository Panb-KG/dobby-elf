/**
 * API 鉴权中间件工具
 * 
 * 用于保护需要登录的 API 路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../lib/auth';
import { getSecurityHeaders } from '../lib/security';

/**
 * 需要认证的路由前缀
 */
const PROTECTED_PATHS = [
  '/api/courses',
  '/api/homework',
  '/api/achievements',
  '/api/users',
  '/api/focus',
  '/api/chat',
  '/api/image',
  '/api/exercises',
  '/api/knowledge',
  '/api/questions',
];

/**
 * 检查路由是否需要认证
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATHS.some(prefix => pathname.startsWith(prefix));
}

/**
 * API 鉴权中间件
 * 
 * 在 route.ts 中调用：
 * ```
 * const user = requireAuth(req);
 * if (!user) {
 *   return NextResponse.json({ error: '未授权' }, { status: 401 });
 * }
 * ```
 */
export function requireAuth(req: NextRequest): { userId: string; username: string } | null {
  return authenticateRequest(req);
}

/**
 * 获取用户 ID（从 JWT 或 URL 参数）
 * 
 * 用于需要区分用户数据的 API
 */
export function getUserId(req: NextRequest, user: { userId: string; username: string }): string {
  // 可以扩展为支持管理员查看其他用户数据
  return user.userId;
}

/**
 * 创建未授权响应
 */
export function unauthorizedResponse(message: string = '未授权，请先登录'): NextResponse {
  return NextResponse.json(
    { error: message },
    { 
      status: 401,
      headers: getSecurityHeaders()
    }
  );
}
