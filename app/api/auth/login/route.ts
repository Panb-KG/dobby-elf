import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const db = getDb();

    const user = db.prepare(`
      SELECT id, username, password, display_name, email, created_at, points, level, tree_growth
      FROM users WHERE username = ?
    `).get(username) as any;

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const tasks = db.prepare(`
      SELECT id, text, completed, reward FROM daily_tasks WHERE user_id = ?
    `).all(user.id);

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, username: user.username },
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
        createdAt: user.created_at,
        points: user.points,
        level: user.level,
        treeGrowth: user.tree_growth,
        dailyTasks: tasks
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
