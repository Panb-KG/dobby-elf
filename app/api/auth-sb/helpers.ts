import { createClient } from '@supabase/supabase-js';

// 惰性读取环境变量（避免模块加载时变量未就绪）
export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}
export function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}
export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

// Service role 客户端（服务端专用，绕过 RLS）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();
  if (!url || !key) {
    console.warn('[Supabase] service client: url=%s key=%s', !!url, !!key);
    return null;
  }
  return createClient<any>(url, key);
}

// Anon 客户端（用于 Auth 验证密码）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAnon() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    console.warn('[Supabase] anon client: url=%s key=%s', !!url, !!key);
    return null;
  }
  return createClient<any>(url, key, {
    auth: { persistSession: false }
  });
}

// 生成假邮箱（用户名登录，不使用真实邮箱）
export function toFakeEmail(username: string): string {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `${cleanUsername}@dobby-elf.app`;
}

// 简易 token 生成（本地回退用）
export function generateToken(): string {
  return 'tk_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 本地用户 ID 生成（基于用户名的确定性 ID）
export function getLocalUserId(username: string): string {
  let hash = 0;
  const str = 'local_' + username;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'local_' + Math.abs(hash).toString(36).padStart(12, '0');
}
