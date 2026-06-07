/**
 * Supabase 数据库类型定义
 * 自动生成命令: npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
 * 
 * 当前为手动维护版本，匹配 supabase/schema.sql
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          role: 'student' | 'parent' | 'teacher';
          grade: number | null;
          school: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          role?: 'student' | 'parent' | 'teacher';
          grade?: number | null;
          school?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          role?: 'student' | 'parent' | 'teacher';
          grade?: number | null;
          school?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          model?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          model?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          images: string[] | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          images?: string[] | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          images?: string[] | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          teacher: string | null;
          location: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          teacher?: string | null;
          location?: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          teacher?: string | null;
          location?: string | null;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          color?: string | null;
          created_at?: string;
        };
      };
      knowledge_nodes: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          topic: string;
          mastery: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          topic: string;
          mastery?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          topic?: string;
          mastery?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string | null;
          subject: string;
          question: string;
          answer: string | null;
          user_answer: string | null;
          is_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id?: string | null;
          subject: string;
          question: string;
          answer?: string | null;
          user_answer?: string | null;
          is_correct?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string | null;
          subject?: string;
          question?: string;
          answer?: string | null;
          user_answer?: string | null;
          is_correct?: boolean | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}
