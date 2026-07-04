import { NextRequest, NextResponse } from 'next/server';
import { supabaseUrl, supabaseServiceKey, getSupabase } from './helpers';
import { handleRegisterParent, handleRegisterStudent } from './handlers-register';
import { handleLogin, handleChildLogin, handleAutoLogin } from './handlers-login';

/**
 * Supabase 认证 API（服务端，使用 service_role key）
 *
 * POST /api/auth-sb?action=register_parent - 家长注册
 * POST /api/auth-sb?action=register        - 学生注册
 * POST /api/auth-sb?action=login           - 家长登录
 * POST /api/auth-sb?action=child_login     - 孩子PIN登录
 * GET  /api/auth-sb?action=me              - 获取当前用户
 */

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'register_parent':
        return handleRegisterParent(body);
      case 'register':
        return handleRegisterStudent(body);
      case 'login':
        return handleLogin(body);
      case 'child_login':
        return handleChildLogin(body);
      case 'auto_login':
        return handleAutoLogin(body);
      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }
  } catch (err) {
    console.error('Auth API error:', err);
    return NextResponse.json({ error: '魔法出错了，请稍后再试' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'me') {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const client = getSupabase();
    if (!client) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

    // 用 token 验证用户身份并获取 user id
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: '用户资料不存在' }, { status: 404 });

    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        grade: profile.grade,
        displayName: profile.display_name || profile.username,
        points: profile.points || 0,
        level: String(profile.level || 1),
        treeGrowth: profile.tree_growth || 0,
        dailyTasks: [],
      },
    });
  }

  return NextResponse.json({ error: '无效的操作' }, { status: 400 });
}
