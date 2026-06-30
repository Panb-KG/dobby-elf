import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Service role 客户端（服务端专用，绕过 RLS）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient<any>(supabaseUrl, supabaseServiceKey);
}

// Anon 客户端（用于 Auth 验证密码）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAnon() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
}

// 生成假邮箱（用户名登录，不使用真实邮箱）
export function toFakeEmail(username: string): string {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `${cleanUsername}@dobby-elf.app`;
}

// 简易 token 生成
export function generateToken(): string {
  return 'tk_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export { supabaseUrl, supabaseServiceKey };
