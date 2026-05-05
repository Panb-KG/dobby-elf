import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { error } from '../../../lib/console';
import bcrypt from 'bcrypt';

// 注册速率限制：每分钟 5 次
const registerLimiter = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = registerLimiter.get(ip);
  if (!record || now > record.resetAt) {
    registerLimiter.set(ip, { count: 1, resetAt: now + 60000 });
    return false;
  }
  if (record.count >= 5) return true;
  record.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    if (username.length < 2) {
      return NextResponse.json({ error: '用户名至少2个字符' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6个字符' }, { status: 400 });
    }

    const db = getDb();

    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }

    // 创建新用户
    const userId = `user_${Date.now()}`;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    db.prepare(`
      INSERT INTO users (id, username, password, display_name, email, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, username, hashedPassword, username, `${username}@dobi.local`, new Date().toISOString());

    // 创建默认每日任务
    const tasks = [
      { id: `task_${Date.now()}_1`, text: '完成3道奥数题', reward: 50 },
      { id: `task_${Date.now()}_2`, text: '背诵5个新单词', reward: 30 },
      { id: `task_${Date.now()}_3`, text: '查看今日课程表', reward: 10 },
    ];

    const insertTask = db.prepare(`
      INSERT INTO daily_tasks (id, user_id, text, completed, reward)
      VALUES (?, ?, ?, ?, ?)
    `);

    tasks.forEach(task => {
      insertTask.run(task.id, userId, task.text, 0, task.reward);
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        username,
        displayName: username,
        email: `${username}@dobi.local`,
        createdAt: new Date().toISOString(),
        points: 1250,
        level: '魔法学徒',
        treeGrowth: 0,
        dailyTasks: tasks.map(t => ({ ...t, completed: false }))
      }
    });
  } catch (error: any) {
    error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
