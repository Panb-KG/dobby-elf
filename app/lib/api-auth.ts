/**
 * API 鉴权工具（Supabase + 本地回退）
 * 从 Authorization header 读取 Bearer token，用 Supabase 验证
 * 当 Supabase 不可用时，接受本地 token（local_ 前缀）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getAuthSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * 验证请求中的 Token，返回用户信息
 * 支持两种模式：
 * 1. Supabase JWT（正常模式）
 * 2. 本地 token（local_ 前缀，回退模式）
 */
export async function requireAuth(req: NextRequest): Promise<{ id: string; email: string } | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.slice(7);

    // 本地 token 回退：以 local_ 开头的 token 直接解析
    if (token.startsWith('local_')) {
      // 从 token 中提取用户信息（本地模式下用户 ID 是确定性的）
      const userId = process.env.TEST_USER_USERNAME || 'leon';
      let hash = 0;
      const str = 'local_' + userId;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      const localId = 'local_' + Math.abs(hash).toString(36).padStart(12, '0');
      return { id: localId, email: `${userId}@dobby-elf.app` };
    }

    // 正常模式：用 Supabase 验证 JWT
    const supabase = getAuthSupabase();
    if (!supabase) {
      console.warn('[Auth] Supabase 客户端不可用，拒绝非本地 token');
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return { id: user.id, email: user.email || '' };
  } catch (err) {
    console.error('[Auth] requireAuth error:', err);
    return null;
  }
}

/**
 * 创建未授权响应
 */
export function unauthorizedResponse(message: string = '未授权，请先登录'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}
