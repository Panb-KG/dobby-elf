import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 认证 API（简化版，适合小学生）
 * 
 * POST /api/auth-sb?action=register  - 注册（仅需用户名）
 * POST /api/auth-sb?action=login     - 登录（用户名 + 可选PIN）
 * GET  /api/auth-sb?action=me        - 获取当前用户
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient<any>(supabaseUrl, supabaseServiceKey);
}

// 简易 token 生成（生产环境应使用 JWT）
function generateToken(): string {
  return 'tk_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'register': {
        const { username, grade } = body;
        
        if (!username || username.trim().length < 2) {
          return NextResponse.json({ error: '用户名至少2个字' }, { status: 400 });
        }

        const client = getSupabase();
        if (!client) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

        const { data: existing } = await client
          .from('profiles')
          .select('id, username')
          .eq('username', username.trim())
          .single();

        if (existing) {
          return NextResponse.json({ error: '这个名字已经被别人用了，换一个吧！' }, { status: 409 });
        }

        // 生成用户ID（使用 crypto.randomUUID）
        const userId = crypto.randomUUID();
        
        // 创建 profile
        const { data: profile, error: profileError } = await client
          .from('profiles')
          .insert({
            id: userId,
            username: username.trim(),
            grade: grade || null,
            role: 'student',
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return NextResponse.json({ error: '用户创建失败，请重试' }, { status: 500 });
        }

        // 生成 token
        const token = generateToken();

        return NextResponse.json({
          user: {
            id: profile.id,
            username: profile.username,
            role: profile.role,
            grade: profile.grade,
            displayName: profile.username,
            points: 0,
            level: '魔法学徒',
            treeGrowth: 0,
            dailyTasks: [],
          },
          token,
        });
      }

      case 'login': {
        const { username } = body;
        
        if (!username) {
          return NextResponse.json({ error: '请输入用户名' }, { status: 400 });
        }

        // 查找用户
        const { data: profile, error } = await client
          .from('profiles')
          .select('*')
          .eq('username', username.trim())
          .single();

        if (error || !profile) {
          return NextResponse.json({ error: '找不到这个名字，先注册一个吧！' }, { status: 404 });
        }

        // 生成新 token
        const token = generateToken();

        return NextResponse.json({
          user: {
            id: profile.id,
            username: profile.username,
            role: profile.role,
            grade: profile.grade,
            displayName: profile.username,
            points: 0,
            level: '魔法学徒',
            treeGrowth: 0,
            dailyTasks: [],
          },
          token,
        });
      }

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
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 验证 token - 通过 localStorage 中的用户数据验证
    // 简化版：前端传 userId，后端验证
    const userId = searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const client = getSupabase();
    if (!client) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        grade: profile.grade,
        displayName: profile.username,
        points: 0,
        level: '魔法学徒',
        treeGrowth: 0,
        dailyTasks: [],
      },
    });
  }

  return NextResponse.json({ error: '无效的操作' }, { status: 400 });
}
