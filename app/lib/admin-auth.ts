/**
 * 管理员鉴权工具
 *
 * 用于保护 /api/admin/* 路由（除 auth 外）
 * 从 JWT token 中提取 adminId 和 role
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ensureJwtSecret } from './auth';
import { getSecurityHeaders } from './security';

export interface AdminPayload {
  adminId: string;
  username: string;
  role: string;
}

/**
 * 从 Headers 中提取 token
 */
function extractToken(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

/**
 * 验证管理员 token
 */
export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const secret = ensureJwtSecret();
    const decoded = jwt.verify(token, secret) as AdminPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * 验证管理员请求（支持 Request 和 NextRequest）
 */
export function requireAdminAuth(req: { headers: Headers }): AdminPayload | null {
  const token = extractToken(req.headers);
  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * 创建未授权响应
 */
export function adminUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: '管理员未授权，请先登录' },
    { status: 401, headers: getSecurityHeaders() }
  );
}

/**
 * 中间件：自动为 /api/admin/* 路由注入鉴权
 */
export function checkAdminAuth(req: NextRequest): NextResponse | null {
  const pathname = new URL(req.url).pathname;

  // auth 路由不需要鉴权
  if (pathname.startsWith('/api/admin/auth')) {
    return null;
  }

  const admin = requireAdminAuth(req);
  if (!admin) {
    return adminUnauthorizedResponse();
  }

  return null;
}
