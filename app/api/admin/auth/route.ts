import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import bcrypt from 'bcrypt';
import { error } from '../../../lib/console';
import jwt from 'jsonwebtoken';
import { ensureJwtSecret } from '../../../lib/auth';

/**
 * 管理员认证 API
 * 
 * POST /api/admin/auth/login  - 管理员登录
 * POST /api/admin/auth/verify - 验证 token
 * POST /api/admin/auth/init   - 初始化管理员账号（仅首次）
 */

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'login';
    
    if (action === 'init') {
      return handleInit(req);
    }
    if (action === 'verify') {
      return handleVerify(req);
    }
    return handleLogin(req);
  } catch (error: any) {
    error('Admin auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleInit(req: Request) {
  const db = getDb();
  
  // 检查是否已有管理员
  const existing = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
  if (existing.count > 0) {
    return NextResponse.json({ error: '管理员账号已存在' }, { status: 400 });
  }
  
  const { username, password, displayName } = await req.json();
  
  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const adminId = `admin_${Date.now()}`;
  
  db.prepare(`
    INSERT INTO admins (id, username, password, display_name, role)
    VALUES (?, ?, ?, ?, 'super_admin')
  `).run(adminId, username, hashedPassword, displayName || username);
  
  // 记录审计日志
  db.prepare(`
    INSERT INTO audit_logs (id, admin_id, action, details)
    VALUES (?, ?, 'init_admin', ?)
  `).run(`audit_${Date.now()}`, adminId, JSON.stringify({ username }));
  
  return NextResponse.json({ success: true, message: '管理员账号创建成功' });
}

async function handleLogin(req: Request) {
  const { username, password } = await req.json();
  
  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
  }
  
  const db = getDb();
  
  const admin = db.prepare(`
    SELECT id, username, password, display_name, role, is_active
    FROM admins WHERE username = ?
  `).get(username) as any;
  
  if (!admin) {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
  }
  
  if (!admin.is_active) {
    return NextResponse.json({ error: '账号已被禁用' }, { status: 403 });
  }
  
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
  }
  
  // 更新最后登录时间
  db.prepare(`UPDATE admins SET last_login = datetime('now') WHERE id = ?`).run(admin.id);
  
  const secret = ensureJwtSecret();
  const token = jwt.sign(
    { adminId: admin.id, username: admin.username, role: admin.role },
    secret,
    { expiresIn: '24h' }
  );
  
  // 记录审计日志
  db.prepare(`
    INSERT INTO audit_logs (id, admin_id, action, details)
    VALUES (?, ?, 'login', ?)
  `).run(`audit_${Date.now()}`, admin.id, JSON.stringify({ username }));
  
  return NextResponse.json({
    success: true,
    admin: {
      id: admin.id,
      username: admin.username,
      displayName: admin.display_name,
      role: admin.role,
    },
    token,
  });
}

async function handleVerify(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  
  const token = authHeader.slice(7);
  const secret = ensureJwtSecret();
  
  try {
    const decoded = jwt.verify(token, secret) as any;
    
    const db = getDb();
    const admin = db.prepare(`
      SELECT id, username, display_name, role, is_active, last_login
      FROM admins WHERE id = ?
    `).get(decoded.adminId) as any;
    
    if (!admin || !admin.is_active) {
      return NextResponse.json({ error: '账号无效或已禁用' }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        displayName: admin.display_name,
        role: admin.role,
        lastLogin: admin.last_login,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Token 无效或已过期' }, { status: 401 });
  }
}
