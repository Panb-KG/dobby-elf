import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { getDb } from '../../../lib/db';
import { error } from '../../../lib/console';
import jwt from 'jsonwebtoken';
import { verifyPassword } from '../../../lib/auth';

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
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }

    const { username, password, pin, childId } = await req.json();

    const db = getDb();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      error('JWT_SECRET 未配置，请设置环境变量');
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
    }

    // ===== 孩子 PIN 登录 =====
    if (pin && childId) {
      const user = db.prepare(`
        SELECT id, username, password, display_name, email, created_at, points, level, tree_growth, role, parent_id, child_name, grade
        FROM users WHERE id = ? AND role = 'child' AND is_active = 1
      `).get(childId) as any;

      if (!user) {
        return NextResponse.json({ error: '账号不存在或已停用' }, { status: 401 });
      }

      // PIN 校验（明文比对，PIN 是 4-6 位数字）
      if (user.password !== pin) {
        return NextResponse.json({ error: 'PIN 码错误' }, { status: 401 });
      }

      const tasks = db.prepare(`
        SELECT id, text, completed, reward FROM daily_tasks WHERE user_id = ?
      `).all(user.id);

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: 'child', parentId: user.parent_id },
        secret,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          email: user.email,
          role: 'child',
          parentId: user.parent_id,
          childName: user.child_name,
          grade: user.grade,
          createdAt: user.created_at,
          points: user.points,
          level: user.level,
          treeGrowth: user.tree_growth,
          dailyTasks: tasks,
        },
        token
      });
    }

    // ===== 家长用户名+密码登录 =====
    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    if (username.length < 2) {
      return NextResponse.json({ error: '用户名至少2个字符' }, { status: 400 });
    }

    const user = db.prepare(`
      SELECT id, username, password, display_name, email, created_at, points, level, tree_growth, role, parent_id, child_name, grade
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

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
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
        role: user.role,
        parentId: user.parent_id,
        childName: user.child_name,
        grade: user.grade,
        createdAt: user.created_at,
        points: user.points,
        level: user.level,
        treeGrowth: user.tree_growth,
        dailyTasks: tasks,
      },
      token
    });

    // 设置 HTTP-only cookie
    response.cookies.set('dobi_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    error('Login error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
