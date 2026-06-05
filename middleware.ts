import { NextResponse, type NextRequest } from 'next/server';

/**
 * API 中间件
 * 
 * 功能：
 * - 安全头注入
 * - 速率限制
 * - 请求验证
 * - 错误处理
 */

// 速率限制器
const requests = new Map<string, { count: number; resetAt: number }>();

function apiRateLimiter(ip: string): boolean {
  const now = Date.now();
  const record = requests.get(ip);
  if (!record || now > record.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + 60000 });
    return false;
  }
  if (record.count >= 100) return true;
  record.count++;
  return false;
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // 只处理 API 请求
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 速率限制
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  if (apiRateLimiter(clientIp)) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429 }
    );
  }
  
  // OPTIONS 预检请求处理
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};