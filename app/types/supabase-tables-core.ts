/**
 * Supabase 核心表类型 - profiles, daily_tasks, conversations, messages
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CoreTables = {
  // ===== 用户资料表 =====
  profiles: {
    Row: {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
      role: 'parent' | 'student' | 'child' | 'teacher';
      grade: number | null;
      school: string | null;
      points: number;
      level: number;
      tree_growth: number;
      parent_id: string | null;
      child_name: string | null;
      pin_code: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id: string;
      username?: string | null;
      display_name?: string | null;
      avatar_url?: string | null;
      role?: 'parent' | 'student' | 'child' | 'teacher';
      grade?: number | null;
      school?: string | null;
      points?: number;
      level?: number;
      tree_growth?: number;
      parent_id?: string | null;
      child_name?: string | null;
      pin_code?: string | null;
      is_active?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      username?: string | null;
      display_name?: string | null;
      avatar_url?: string | null;
      role?: 'parent' | 'student' | 'child' | 'teacher';
      grade?: number | null;
      school?: string | null;
      points?: number;
      level?: number;
      tree_growth?: number;
      parent_id?: string | null;
      child_name?: string | null;
      pin_code?: string | null;
      is_active?: boolean;
      created_at?: string;
      updated_at?: string;
    };
  };
  // ===== 每日任务表 =====
  daily_tasks: {
    Row: { id: string; user_id: string; text: string; completed: boolean; reward: number; created_at: string };
    Insert: { id?: string; user_id: string; text: string; completed?: boolean; reward?: number; created_at?: string };
    Update: { id?: string; user_id?: string; text?: string; completed?: boolean; reward?: number; created_at?: string };
  };
  // ===== 对话表 =====
  conversations: {
    Row: { id: string; user_id: string; title: string; model: string; created_at: string; updated_at: string };
    Insert: { id?: string; user_id: string; title?: string; model?: string; created_at?: string; updated_at?: string };
    Update: { id?: string; user_id?: string; title?: string; model?: string; created_at?: string; updated_at?: string };
  };
  // ===== 消息表 =====
  messages: {
    Row: {
      id: string; conversation_id: string; user_id: string;
      role: 'user' | 'assistant' | 'system'; content: string;
      images: string[] | null; metadata: Json | null; created_at: string;
    };
    Insert: {
      id?: string; conversation_id: string; user_id: string;
      role: 'user' | 'assistant' | 'system'; content: string;
      images?: string[] | null; metadata?: Json | null; created_at?: string;
    };
    Update: {
      id?: string; conversation_id?: string; user_id?: string;
      role?: 'user' | 'assistant' | 'system'; content?: string;
      images?: string[] | null; metadata?: Json | null; created_at?: string;
    };
  };
};
