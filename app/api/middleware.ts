import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// 不需要认证的路径
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/chat', // 聊天API暂时不需要认证
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 跳过不需要认证的路径
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }
  
  // 获取Authorization头
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: '缺少认证信息' }, { status: 401 });
  }
  
  // 提取token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: '无效的认证信息' }, { status: 401 });
  }
  
  try {
    // 验证token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);
    
    // 将用户信息添加到请求头
    const response = NextResponse.next();
    response.headers.set('X-User-ID', (decoded as any).userId);
    return response;
  } catch (error) {
    return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
  }
}

// 配置中间件适用的路径
export const config = {
  matcher: '/api/:path*',
};
