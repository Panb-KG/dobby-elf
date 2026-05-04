import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSecurityHeaders, apiRateLimiter } from './app/lib/security';

/**
 * API 中间件
 * 
 * 功能：
 * - 安全头注入
 * - 速率限制
 * - CORS 处理
 * - 请求验证
 */

// 公开接口（不需要认证）
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
];

// 聊天接口使用更宽松的速率限制
const CHAT_PATHS = ['/api/chat'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 只处理 API 请求
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // 注入安全头
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CORS 处理
  const origin = request.headers.get('origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // 速率限制
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  // 聊天接口更宽松（每分钟 30 次）
  if (CHAT_PATHS.some(p => pathname.startsWith(p))) {
    const chatLimiter = createRateLimiter(30, 60000);
    if (chatLimiter(clientIp)) {
      return NextResponse.json(
        { error: '消息发送过于频繁，请稍后再试' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }
  }
  // 其他接口标准限制（每分钟 100 次）
  else if (!PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    if (apiRateLimiter(clientIp)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }
  }

  return response;
}

/**
 * 配置中间件匹配路径
 */
export const config = {
  matcher: '/api/:path*',
};

/**
 * 速率限制器（内存存储）
 */
function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();
  
  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const userRequests = requests.get(key) || [];
    
    // 清理过期记录
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return true;
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    
    return false;
  };
}
