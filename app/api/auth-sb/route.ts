import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 认证 API（服务端，使用 service_role key）
 * 
 * POST /api/auth-sb?action=register_parent - 家长注册（用户名+密码，自动确认邮箱）
 * POST /api/auth-sb?action=register        - 学生注册（仅需用户名）
 * POST /api/auth-sb?action=login           - 家长登录（用户名+密码）
 * POST /api/auth-sb?action=child_login     - 孩子PIN登录
 * GET  /api/auth-sb?action=me              - 获取当前用户
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Service role 客户端（服务端专用，绕过 RLS）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient<any>(supabaseUrl, supabaseServiceKey);
}

// Anon 客户端（用于 Auth 验证密码）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAnon() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
}

// 生成假邮箱（用户名登录，不使用真实邮箱）
function toFakeEmail(username: string): string {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `${cleanUsername}@dobby-elf.app`;
}

// 简易 token 生成
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
      // ===== 家长注册（用户名+密码，使用 Admin API 自动确认邮箱）=====
      case 'register_parent': {
        const { username, password, phone, realName } = body;
        
        if (!username || username.trim().length < 2) {
          return NextResponse.json({ error: '用户名至少2个字' }, { status: 400 });
        }
        if (!password || password.length < 6) {
          return NextResponse.json({ error: '密码至少需要6个字符' }, { status: 400 });
        }

        const client = getSupabase();
        if (!client) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

        // 1. 检查用户名是否已存在
        const { data: existing } = await client
          .from('profiles')
          .select('id, username')
          .eq('username', username.trim())
          .maybeSingle();

        if (existing) {
          return NextResponse.json({ error: '这个名字已经被别人用了，换一个吧！' }, { status: 409 });
        }

        // 2. 使用 Admin API 创建用户（自动确认邮箱，不发送邮件）
        const fakeEmail = toFakeEmail(username);
        const { data: authData, error: authError } = await client.auth.admin.createUser({
          email: fakeEmail,
          password,
          email_confirm: true,
          user_metadata: {
            username: username.trim(),
            display_name: realName || username.trim(),
          },
        });

        if (authError || !authData.user) {
          const msg = authError?.message || '创建用户失败';
          if (msg.includes('already') || msg.includes('registered')) {
            return NextResponse.json({ error: '该用户名已存在，请换个名字' }, { status: 409 });
          }
          if (msg.includes('rate limit')) {
            return NextResponse.json({ error: '注册太频繁，请稍后再试' }, { status: 429 });
          }
          return NextResponse.json({ error: '注册失败：' + msg }, { status: 500 });
        }

        // 3. 创建 profile（trigger 可能已自动创建，如果没有则手动创建）
        let { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!profile) {
          const { data: newProfile, error: insertError } = await client
            .from('profiles')
            .insert({
              id: authData.user.id,
              username: username.trim(),
              display_name: realName || username.trim(),
              role: 'parent',
              points: 0,
              level: 1,
              tree_growth: 0,
              is_active: true,
            })
            .select()
            .single();
          
          if (insertError || !newProfile) {
            return NextResponse.json({ error: '创建用户资料失败: ' + (insertError?.message || '') }, { status: 500 });
          }
          profile = newProfile;
        }

        const token = generateToken();

        return NextResponse.json({
          user: {
            id: profile.id,
            username: profile.username,
            role: profile.role || 'parent',
            displayName: profile.display_name || profile.username,
            points: profile.points || 0,
            level: String(profile.level || 1),
            treeGrowth: profile.tree_growth || 0,
            dailyTasks: [],
          },
          token,
        });
      }

      // ===== 学生注册（仅用户名，不走 Supabase Auth）=====
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
          .maybeSingle();

        if (existing) {
          return NextResponse.json({ error: '这个名字已经被别人用了，换一个吧！' }, { status: 409 });
        }

        const userId = crypto.randomUUID();
        
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
          return NextResponse.json({ error: '用户创建失败，请重试' }, { status: 500 });
        }

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

      // ===== 家长登录（用户名+密码，通过 Supabase Auth 验证）=====
      case 'login': {
        const { username, password } = body;
        
        if (!username) {
          return NextResponse.json({ error: '请输入用户名' }, { status: 400 });
        }

        const client = getSupabase();
        if (!client) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

        // 如果有密码，走 Supabase Auth 验证
        if (password) {
          const anonClient = getSupabaseAnon();
          if (!anonClient) {
            return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });
          }

          const fakeEmail = toFakeEmail(username);
          const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
            email: fakeEmail,
            password,
          });

          if (authError || !authData.user) {
            const msg = authError?.message || '';
            if (msg.includes('Invalid login credentials')) {
              return NextResponse.json({ error: '用户名或密码错误，请重试' }, { status: 401 });
            }
            if (msg.includes('Email not confirmed')) {
              return NextResponse.json({ error: '账号尚未验证，请联系管理员' }, { status: 401 });
            }
            if (msg.includes('rate limit')) {
              return NextResponse.json({ error: '尝试次数太多，请稍后再试' }, { status: 429 });
            }
            return NextResponse.json({ error: '登录失败：' + msg }, { status: 401 });
          }

          // 获取 profile
          const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileError || !profile) {
            // 自动创建 profile（如果不存在）
            const { data: newProfile } = await client
              .from('profiles')
              .insert({
                id: authData.user.id,
                username: username.trim(),
                display_name: username.trim(),
                role: 'parent',
                points: 0,
                level: 1,
                tree_growth: 0,
                is_active: true,
              })
              .select()
              .single();
            
            if (!newProfile) {
              return NextResponse.json({ error: '用户资料不存在，请联系管理员' }, { status: 404 });
            }
            
            const token = authData.session?.access_token || generateToken();
            return NextResponse.json({
              user: {
                id: newProfile.id,
                username: newProfile.username,
                role: newProfile.role || 'parent',
                displayName: newProfile.display_name || newProfile.username,
                points: newProfile.points || 0,
                level: String(newProfile.level || 1),
                treeGrowth: newProfile.tree_growth || 0,
                dailyTasks: [],
              },
              token,
            });
          }

          const token = authData.session?.access_token || generateToken();
          return NextResponse.json({
            user: {
              id: profile.id,
              username: profile.username,
              role: profile.role || 'parent',
              displayName: profile.display_name || profile.username,
              points: profile.points || 0,
              level: String(profile.level || 1),
              treeGrowth: profile.tree_growth || 0,
              dailyTasks: [],
            },
            token,
          });
        }

        // 无密码：旧版简化登录（查找用户）
        const { data: profile, error } = await client
          .from('profiles')
          .select('*')
          .eq('username', username.trim())
          .maybeSingle();

        if (error || !profile) {
          return NextResponse.json({ error: '找不到这个名字，先注册一个吧！' }, { status: 404 });
        }

        const token = generateToken();

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
          token,
        });
      }

      // ===== 孩子 PIN 登录 =====
      case 'child_login': {
        const { childId, pin } = body;
        
        if (!childId || !pin) {
          return NextResponse.json({ error: '请输入PIN码' }, { status: 400 });
        }

        const client = getSupabase();
        if (!client) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

        const { data: profile, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', childId)
          .eq('pin_code', pin)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !profile) {
          return NextResponse.json({ error: 'PIN 码错误，请重试' }, { status: 401 });
        }

        const token = generateToken();

        return NextResponse.json({
          user: {
            id: profile.id,
            username: profile.username,
            role: profile.role || 'child',
            displayName: profile.display_name || profile.username,
            childName: profile.child_name,
            grade: profile.grade ? String(profile.grade) : undefined,
            points: profile.points || 0,
            level: String(profile.level || 1),
            treeGrowth: profile.tree_growth || 0,
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
