import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAnon, toFakeEmail, generateToken, getLocalUserId } from './helpers';

// 本地回退用户信息
function getLocalFallbackUser(username: string) {
  const localId = getLocalUserId(username);
  const token = 'local_' + generateToken();
  return {
    user: {
      id: localId,
      username: username,
      role: 'student' as const,
      grade: 3,
      displayName: username,
      points: 0,
      level: '1',
      treeGrowth: 0,
      dailyTasks: [],
    },
    token,
    isLocal: true,
  };
}

// 测试用户自动登录（单用户测试阶段，程序默认以 Leon 身份登录）
export async function handleAutoLogin(body: any) {
  const testUsername = process.env.TEST_USER_USERNAME || 'leon';
  const testPassword = process.env.TEST_USER_PASSWORD || 'dobby-elf-2024';

  const client = getSupabase();
  const anonClient = getSupabaseAnon();

  // 如果 Supabase 客户端不可用，直接走本地回退
  if (!client || !anonClient) {
    console.warn('[AutoLogin] Supabase 客户端不可用 (client=%s anon=%s)，使用本地回退', !!client, !!anonClient);
    const fallback = getLocalFallbackUser(testUsername);
    return NextResponse.json(fallback);
  }

  try {
    const fakeEmail = toFakeEmail(testUsername);
    let authUserId: string | null = null;
    let authAccessToken: string | null = null;

    // 第一步：尝试用 Supabase Auth 登录
    const { data: initialAuth, error: initialError } = await anonClient.auth.signInWithPassword({
      email: fakeEmail,
      password: testPassword,
    });

    if (initialAuth.user && !initialError) {
      authUserId = initialAuth.user.id;
      authAccessToken = initialAuth.session?.access_token || null;
      console.log('[AutoLogin] Supabase Auth 登录成功: %s', authUserId);
    } else {
      console.warn('[AutoLogin] 登录失败，尝试自动创建用户:', initialError?.message);

      // 第二步：尝试通过 Admin API 创建用户
      const { data: createData, error: createError } = await client.auth.admin.createUser({
        email: fakeEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          username: testUsername,
          display_name: testUsername,
        },
      });

      if (createError || !createData.user) {
        // 用户可能已存在但密码不对
        if (createError?.message?.includes('already') || createError?.message?.includes('registered')) {
          console.warn('[AutoLogin] 用户已存在，尝试重置密码...');
          const { data: existingProfile } = await client
            .from('profiles')
            .select('id')
            .eq('username', testUsername)
            .maybeSingle();

          if (existingProfile) {
            await client.auth.admin.updateUserById(existingProfile.id, { password: testPassword });
            const { data: retryAuth, error: retryError } = await anonClient.auth.signInWithPassword({ email: fakeEmail, password: testPassword });
            if (retryError || !retryAuth.user) {
              console.error('[AutoLogin] 密码重置后登录仍失败:', retryError?.message);
              // 回退到本地模式
              const fallback = getLocalFallbackUser(testUsername);
              return NextResponse.json(fallback);
            }
            authUserId = retryAuth.user.id;
            authAccessToken = retryAuth.session?.access_token || null;
          } else {
            console.warn('[AutoLogin] 用户存在但 profiles 中无记录，使用本地回退');
            const fallback = getLocalFallbackUser(testUsername);
            return NextResponse.json(fallback);
          }
        } else {
          console.error('[AutoLogin] 创建用户失败: %s，使用本地回退', createError?.message);
          const fallback = getLocalFallbackUser(testUsername);
          return NextResponse.json(fallback);
        }
      } else {
        // 用户创建成功，用新凭据登录
        console.log('[AutoLogin] 用户自动创建成功，正在登录...');
        const { data: retryAuth2, error: retryError2 } = await anonClient.auth.signInWithPassword({ email: fakeEmail, password: testPassword });
        if (retryError2 || !retryAuth2.user) {
          console.error('[AutoLogin] 创建后登录失败: %s，使用本地回退', retryError2?.message);
          const fallback = getLocalFallbackUser(testUsername);
          return NextResponse.json(fallback);
        }
        authUserId = retryAuth2.user.id;
        authAccessToken = retryAuth2.session?.access_token || null;
      }
    }

    if (!authUserId) {
      console.warn('[AutoLogin] 无法获取用户身份，使用本地回退');
      const fallback = getLocalFallbackUser(testUsername);
      return NextResponse.json(fallback);
    }

    // 获取用户资料
    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (!profile) {
      // 自动创建 profile
      const { data: newProfile } = await client
        .from('profiles')
        .insert({
          id: authUserId,
          username: testUsername,
          display_name: testUsername,
          role: 'student',
          grade: 3,
          points: 0, level: 1, tree_growth: 0, is_active: true,
        })
        .select().single();

      if (!newProfile) {
        console.warn('[AutoLogin] 创建 profile 失败，使用本地回退');
        const fallback = getLocalFallbackUser(testUsername);
        return NextResponse.json(fallback);
      }

      const token = authAccessToken || generateToken();
      return NextResponse.json({
        user: {
          id: newProfile.id, username: newProfile.username,
          role: newProfile.role || 'student', grade: newProfile.grade,
          displayName: newProfile.display_name || newProfile.username,
          points: newProfile.points || 0, level: String(newProfile.level || 1),
          treeGrowth: newProfile.tree_growth || 0, dailyTasks: [],
        },
        token,
      });
    }

    const token = authAccessToken || generateToken();
    return NextResponse.json({
      user: {
        id: profile.id, username: profile.username,
        role: profile.role || 'student', grade: profile.grade,
        displayName: profile.display_name || profile.username,
        points: profile.points || 0, level: String(profile.level || 1),
        treeGrowth: profile.tree_growth || 0, dailyTasks: [],
      },
      token,
    });
  } catch (err) {
    console.error('[AutoLogin] 异常，使用本地回退:', err);
    const fallback = getLocalFallbackUser(testUsername);
    return NextResponse.json(fallback);
  }
}

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
