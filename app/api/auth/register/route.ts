import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { getDb } from '../../../lib/db';
import { error } from '../../../lib/console';
import { hashPassword, validateUsername, validatePassword } from '../../../lib/auth';

// 注册速率限制：每分钟 3 次（家长注册频率更低）
const registerLimiter = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = registerLimiter.get(ip);
  if (!record || now > record.resetAt) {
    registerLimiter.set(ip, { count: 1, resetAt: now + 60000 });
    return false;
  }
  if (record.count >= 3) return true;
  record.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }

    const { username, password, phone, realName } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    // 验证用户名
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6个字符' }, { status: 400 });
    }

    // 手机号格式校验（可选，但填了就要合法）
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: '请输入正确的手机号码' }, { status: 400 });
    }

    const db = getDb();

    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }

    // 检查手机号是否已被其他家长注册
    if (phone) {
      const existingPhone = db.prepare(
        "SELECT id FROM parent_profiles WHERE phone = ?"
      ).get(phone);
      if (existingPhone) {
        return NextResponse.json({ error: '该手机号已被注册' }, { status: 409 });
      }
    }

    // 创建家长账号
    const userId = `user_${Date.now()}`;
    const hashedPassword = await hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, username, password, display_name, email, role, created_at)
      VALUES (?, ?, ?, ?, ?, 'parent', ?)
    `).run(
      userId,
      username,
      hashedPassword,
      realName || username,
      `${username}@dobi.local`,
      new Date().toISOString()
    );

    // 创建家长资料
    if (phone || realName) {
      db.prepare(`
        INSERT INTO parent_profiles (user_id, phone, real_name, relationship)
        VALUES (?, ?, ?, ?)
      `).run(userId, phone || null, realName || null, 'parent');
    }

    return NextResponse.json({
      success: true,
      message: '家长账号注册成功，快去添加孩子吧！',
      user: {
        id: userId,
        username,
        displayName: realName || username,
        role: 'parent' as const,
        createdAt: new Date().toISOString(),
      }
    });
  } catch (err: unknown) {
    error('Registration error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
