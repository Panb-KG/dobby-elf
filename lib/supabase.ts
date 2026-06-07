import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 凭证未配置，部分功能不可用');
}

// 客户端单例（浏览器）
let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

// 服务端客户端（每次新建，避免内存泄漏）
export function getSupabaseServerClient(): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

// 订阅工具（实时同步）
export function subscribeToTable(
  table: keyof Database['public']['Tables'],
  userId: string,
  onInsert?: (payload: unknown) => void,
  onUpdate?: (payload: unknown) => void,
  onDelete?: (payload: unknown) => void
): RealtimeChannel {
  const client = getSupabaseBrowserClient();
  const channel = client
    .channel(`${table}:user_id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: table as string,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onInsert?.(payload)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: table as string,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onUpdate?.(payload)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: table as string,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onDelete?.(payload)
    )
    .subscribe();

  return channel;
}

export function unsubscribeChannel(channel: RealtimeChannel): void {
  channel.unsubscribe();
}
