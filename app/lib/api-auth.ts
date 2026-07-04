/**
 * API 鉴权工具（Supabase 版本）
 * 从 Authorization header 读取 Bearer token，用 Supabase 验证
 * 
 * TODO: 登录功能搁置期间，未登录用户返回默认访客身份
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let authSupabase: SupabaseClient | null = null;

function getAuthSupabase(): SupabaseClient {
  if (!authSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase 环境变量未配置');
    }
    authSupabase = createClient(url, key);
  }
  return authSupabase;
}

/**
 * 验证请求中的 Supabase Access Token，返回用户信息
 * TODO: 登录功能搁置期间，未登录用户返回默认访客身份
 */
export async function requireAuth(req: NextRequest): Promise<{ userId: string; email: string } | null> {
  try {
    // 从 header 提取 Bearer token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      // TODO: 登录功能搁置期间，返回访客身份
      return { userId: 'guest', email: '' };
    }
    const token = authHeader.slice(7);

    // 用 anon key 创建客户端，验证 token
    const supabase = getAuthSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // TODO: 登录功能搁置期间，验证失败也返回访客身份
      return { userId: 'guest', email: '' };
    }

    return {
      userId: user.id,
      email: user.email || '',
    };
  } catch {
    // TODO: 登录功能搁置期间，异常也返回访客身份
    return { userId: 'guest', email: '' };
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
