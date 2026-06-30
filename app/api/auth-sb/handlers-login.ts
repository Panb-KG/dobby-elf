import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAnon, toFakeEmail, generateToken } from './helpers';

// 家长登录（用户名+密码，通过 Supabase Auth 验证）
export async function handleLogin(body: any) {
  const { username, password } = body;

  if (!username) {
    return NextResponse.json({ error: '请输入用户名' }, { status: 400 });
  }

  const client = getSupabase();
  if (!client) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

  if (password) {
    const anonClient = getSupabaseAnon();
    if (!anonClient) return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });

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

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      const { data: newProfile } = await client
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username.trim(),
          display_name: username.trim(),
          role: 'parent',
          points: 0, level: 1, tree_growth: 0, is_active: true,
        })
        .select().single();

      if (!newProfile) {
        return NextResponse.json({ error: '用户资料不存在，请联系管理员' }, { status: 404 });
      }

      const token = authData.session?.access_token || generateToken();
      return NextResponse.json({
        user: {
          id: newProfile.id, username: newProfile.username,
          role: newProfile.role || 'parent',
          displayName: newProfile.display_name || newProfile.username,
          points: newProfile.points || 0, level: String(newProfile.level || 1),
          treeGrowth: newProfile.tree_growth || 0, dailyTasks: [],
        },
        token,
      });
    }

    const token = authData.session?.access_token || generateToken();
    return NextResponse.json({
      user: {
        id: profile.id, username: profile.username,
        role: profile.role || 'parent',
        displayName: profile.display_name || profile.username,
        points: profile.points || 0, level: String(profile.level || 1),
        treeGrowth: profile.tree_growth || 0, dailyTasks: [],
      },
      token,
    });
  }

  // 无密码：旧版简化登录
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
      id: profile.id, username: profile.username, role: profile.role,
      grade: profile.grade, displayName: profile.display_name || profile.username,
      points: profile.points || 0, level: String(profile.level || 1),
      treeGrowth: profile.tree_growth || 0, dailyTasks: [],
    },
    token,
  });
}

// 孩子 PIN 登录
export async function handleChildLogin(body: any) {
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
      id: profile.id, username: profile.username,
      role: profile.role || 'child',
      displayName: profile.display_name || profile.username,
      childName: profile.child_name,
      grade: profile.grade ? String(profile.grade) : undefined,
      points: profile.points || 0, level: String(profile.level || 1),
      treeGrowth: profile.tree_growth || 0, dailyTasks: [],
    },
    token,
  });
}
