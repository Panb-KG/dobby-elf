import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { error } from '../../../lib/console';
import { signToken, verifyPassword, validateUsername } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
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

    const token = signToken({ userId: user.id, username: user.username });

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
