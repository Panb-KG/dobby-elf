import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { error } from '../../../lib/console';
import jwt from 'jsonwebtoken';
import { apiRateLimiter } from '../../../lib/security';

// 登录速率限制：每分钟 10 次
const loginLimiter = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginLimiter.get(ip);
  if (!record || now > record.resetAt) {
    loginLimiter.set(ip, { count: 1, resetAt: now + 60000 });
    return false;
  }
  if (record.count >= 10) return true;
  record.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    // 速率限制
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error }, { status: 400 });
    }

    const db = getDb();

    const user = db.prepare(`
      SELECT id, username, password, display_name, email, created_at, points, level, tree_growth
      FROM users WHERE username = ?
    `).get(username) as any;

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const tasks = db.prepare(`
      SELECT id, text, completed, reward FROM daily_tasks WHERE user_id = ?
    `).all(user.id);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      error('JWT_SECRET 未配置，请设置环境变量');
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        createdAt: user.created_at,
        points: user.points,
        level: user.level,
        treeGrowth: user.tree_growth,
        dailyTasks: tasks
      },
      token
    });

    // 设置 HTTP-only cookie
    response.cookies.set('dobi_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
