import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-helper';
import { getDb } from '../../lib/db';
import { error, info } from '../../lib/console';
import { authenticateRequest } from '../../lib/auth';

/**
 * GET /api/children - 获取当前家长下的所有孩子账号
 */
export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
    }

    const db = getDb();

    // 确认是家长角色
    const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(auth.userId) as any;
    if (!currentUser || currentUser.role !== 'parent') {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    // 获取该家长下的所有孩子
    const children = db.prepare(`
      SELECT id, username, display_name, child_name, grade, pin_code, avatar_url,
             is_active, points, level, tree_growth, created_at
      FROM users
      WHERE parent_id = ? AND role = 'child'
      ORDER BY created_at ASC
    `).all(auth.userId) as any[];

    // 脱敏：隐藏完整 PIN
    const safeChildren = children.map(c => ({
      id: c.id,
      username: c.username,
      displayName: c.display_name,
      childName: c.child_name,
      grade: c.grade,
      pinCode: c.pin_code ? `${c.pin_code.slice(0, 2)}****` : '',
      avatarUrl: c.avatar_url,
      isActive: c.is_active === 1,
      points: c.points,
      level: c.level,
      treeGrowth: c.tree_growth,
      createdAt: c.created_at,
    }));

    return NextResponse.json({ success: true, children: safeChildren });
  } catch (err: unknown) {
    error('Get children error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

/**
 * POST /api/children - 家长创建孩子账号
 */
export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
    }

    const db = getDb();

    // 确认是家长角色
    const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(auth.userId) as any;
    if (!currentUser || currentUser.role !== 'parent') {
      return NextResponse.json({ error: '仅家长账号可以添加孩子' }, { status: 403 });
    }

    const { childName, grade, pinCode, avatarUrl } = await req.json();

    // 校验
    if (!childName || childName.trim().length === 0) {
      return NextResponse.json({ error: '请输入孩子的名字' }, { status: 400 });
    }

    if (!grade) {
      return NextResponse.json({ error: '请选择孩子年级' }, { status: 400 });
    }

    if (!pinCode || !/^\d{4,6}$/.test(pinCode)) {
      return NextResponse.json({ error: 'PIN 码为 4-6 位数字' }, { status: 400 });
    }

    // 检查该家长下是否已有 5 个孩子（上限）
    const childCount = db.prepare(
      'SELECT COUNT(*) as count FROM users WHERE parent_id = ? AND role = "child"'
    ).get(auth.userId) as any;

    if (childCount.count >= 5) {
      return NextResponse.json({ error: '最多添加 5 个孩子账号' }, { status: 400 });
    }

    // 检查 PIN 是否已被该家长的其他孩子使用
    const existingPin = db.prepare(
      "SELECT id FROM users WHERE parent_id = ? AND pin_code = ? AND role = 'child'"
    ).get(auth.userId, pinCode);

    if (existingPin) {
      return NextResponse.json({ error: '该 PIN 码已被使用，请换一个' }, { status: 409 });
    }

    // 创建孩子账号
    const childId = `child_${Date.now()}`;
    const username = `child_${Date.now()}`;

    db.prepare(`
      INSERT INTO users (id, username, password, display_name, role, parent_id, child_name, grade, pin_code, avatar_url, created_at)
      VALUES (?, ?, ?, ?, 'child', ?, ?, ?, ?, ?, ?)
    `).run(
      childId,
      username,
      pinCode, // PIN 明文存储（孩子用 PIN 登录，非密码）
      childName.trim(),
      auth.userId,
      childName.trim(),
      grade,
      pinCode,
      avatarUrl || null,
      new Date().toISOString()
    );

    // 创建默认每日任务
    const tasks = [
      { id: `task_${Date.now()}_1`, text: '完成3道数学题', reward: 50 },
      { id: `task_${Date.now()}_2`, text: '背诵5个英语单词', reward: 30 },
      { id: `task_${Date.now()}_3`, text: '查看今日课程表', reward: 10 },
    ];

    const insertTask = db.prepare(`
      INSERT INTO daily_tasks (id, user_id, text, completed, reward)
      VALUES (?, ?, ?, 0, ?)
    `);

    tasks.forEach(task => {
      insertTask.run(task.id, childId, task.text, task.reward);
    });

    info(`家长 ${auth.userId} 创建了孩子账号 ${childId} (${childName})`);

    return NextResponse.json({
      success: true,
      message: '孩子账号创建成功！',
      child: {
        id: childId,
        childName: childName.trim(),
        grade,
        pinCode: `${pinCode.slice(0, 2)}****`,
        avatarUrl: avatarUrl || null,
        isActive: true,
        points: 1250,
        level: '魔法学徒',
        treeGrowth: 0,
        createdAt: new Date().toISOString(),
      }
    });
  } catch (err: unknown) {
    error('Create child error:', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
