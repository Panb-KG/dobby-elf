import { NextResponse } from 'next/server';
import { getSupabase, toFakeEmail, generateToken } from './helpers';

// 家长注册（用户名+密码，使用 Admin API 自动确认邮箱）
export async function handleRegisterParent(body: any) {
  const { username, password, phone, realName } = body;

  if (!username || username.trim().length < 2) {
    return NextResponse.json({ error: '用户名至少2个字' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: '密码至少需要6个字符' }, { status: 400 });
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
  } else if (profile.role !== 'parent') {
    const { data: updated } = await client
      .from('profiles')
      .update({ role: 'parent', display_name: realName || profile.display_name || username.trim() })
      .eq('id', authData.user.id)
      .select('*')
      .single();
    if (updated) profile = updated;
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

// 学生注册（仅用户名，不走 Supabase Auth）
export async function handleRegisterStudent(body: any) {
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
