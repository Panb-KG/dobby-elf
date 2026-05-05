/**
 * 统一认证工具
 * 
 * 功能：
 * - JWT 签发与验证
 * - 环境变量检查
 * - 密码安全
 * - 用户信息提取
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

// ===== JWT 配置 =====

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

/**
 * 启动时检查 JWT 密钥
 * 
 * 必须在服务启动时调用，缺失则报错
 */
export function ensureJwtSecret(): string {
  if (!JWT_SECRET || JWT_SECRET.length < 16) {
    throw new Error(
      'JWT_SECRET 环境变量未配置或强度不足（至少16位）。' +
      '请设置强随机密钥：openssl rand -base64 32'
    );
  }
  return JWT_SECRET;
}

/**
 * 签发 JWT Token
 */
export function signToken(payload: { userId: string; username: string }): string {
  const secret = ensureJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    const secret = ensureJwtSecret();
    const decoded = jwt.verify(token, secret);
    return decoded as { userId: string; username: string };
  } catch {
    return null;
  }
}

/**
 * 从请求中提取 Token
 * 
 * 支持：
 * - Authorization: Bearer <token>
 * - Cookie: dobi_auth_token=<token>
 */
export function extractToken(req: NextRequest): string | null {
  // 1. Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // 2. Cookie
  const cookieToken = req.cookies.get('dobi_auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * 验证请求中的 Token，返回用户信息或 null
 */
export function authenticateRequest(req: NextRequest): { userId: string; username: string } | null {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

// ===== 密码安全 =====

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) {
    return { valid: false, error: '密码长度至少6位' };
  }
  if (password.length > 128) {
    return { valid: false, error: '密码长度不能超过128位' };
  }
  return { valid: true };
}

/**
 * 验证用户名
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 2) {
    return { valid: false, error: '用户名长度至少2位' };
  }
  if (username.length > 32) {
    return { valid: false, error: '用户名长度不能超过32位' };
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    return { valid: false, error: '用户名只能包含字母、数字、下划线和中文' };
  }
  return { valid: true };
}
