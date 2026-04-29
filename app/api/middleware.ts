import { NextResponse } from 'next/server';
import { getSecurityHeaders, apiRateLimiter, isValidUserId } from '../lib/security';

/**
 * API 中间件
 * 
 * 功能：
 * - 安全头注入
 * - 速率限制
 * - 请求验证
 * - 错误处理
 */

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // 只处理 API 请求
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 1. 速率限制
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  if (apiRateLimiter(clientIp)) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429, headers: getSecurityHeaders() }
    );
  }
  
  // 2. 创建响应并注入安全头
  const response = NextResponse.next();
  
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // 3. CORS 头（如果需要）
  const origin = req.headers.get('origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  // 4. OPTIONS 预检请求处理
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }
  
  return response;
}

/**
 * 配置中间件匹配路径
 */
export const config = {
  matcher: '/api/:path*',
};
