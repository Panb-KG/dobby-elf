/**
 * Supabase 扩展表类型 - courses, knowledge_nodes, exercises, homework, achievements
 */

import type { Json } from './supabase-tables-core';

export type ExtraTables = {
  // ===== 课程表 =====
  courses: {
    Row: {
      id: string; user_id: string; name: string; teacher: string | null;
      location: string | null; day_of_week: number; start_time: string;
      end_time: string; color: string | null; created_at: string;
    };
    Insert: {
      id?: string; user_id: string; name: string; teacher?: string | null;
      location?: string | null; day_of_week: number; start_time: string;
      end_time: string; color?: string | null; created_at?: string;
    };
    Update: {
      id?: string; user_id?: string; name?: string; teacher?: string | null;
      location?: string | null; day_of_week?: number; start_time?: string;
      end_time?: string; color?: string | null; created_at?: string;
    };
  };
  // ===== 知识图谱表 =====
  knowledge_nodes: {
    Row: {
      id: string; user_id: string; subject: string; topic: string;
      mastery: number; created_at: string; updated_at: string;
    };
    Insert: {
      id?: string; user_id: string; subject: string; topic: string;
      mastery?: number; created_at?: string; updated_at?: string;
    };
    Update: {
      id?: string; user_id?: string; subject?: string; topic?: string;
      mastery?: number; created_at?: string; updated_at?: string;
    };
  };
  // ===== 练习题表 =====
  exercises: {
    Row: {
      id: string; user_id: string; conversation_id: string | null;
      subject: string; question: string; answer: string | null;
      user_answer: string | null; is_correct: boolean | null; created_at: string;
    };
    Insert: {
      id?: string; user_id: string; conversation_id?: string | null;
      subject: string; question: string; answer?: string | null;
      user_answer?: string | null; is_correct?: boolean | null; created_at?: string;
    };
    Update: {
      id?: string; user_id?: string; conversation_id?: string | null;
      subject?: string; question?: string; answer?: string | null;
      user_answer?: string | null; is_correct?: boolean | null; created_at?: string;
    };
  };
  // ===== 作业表 =====
  homework: {
    Row: {
      id: string; user_id: string; title: string; description: string | null;
      subject: string | null; due_date: string | null;
      status: 'pending' | 'in_progress' | 'completed';
      image: string | null; created_at: string;
    };
    Insert: {
      id?: string; user_id: string; title: string; description?: string | null;
      subject?: string | null; due_date?: string | null;
      status?: 'pending' | 'in_progress' | 'completed';
      image?: string | null; created_at?: string;
    };
    Update: {
      id?: string; user_id?: string; title?: string; description?: string | null;
      subject?: string | null; due_date?: string | null;
      status?: 'pending' | 'in_progress' | 'completed';
      image?: string | null; created_at?: string;
    };
  };
  // ===== 成就表 =====
  achievements: {
    Row: {
      id: string; user_id: string; title: string; date: string;
      type: string; icon_name: string; color: string; created_at: string;
    };
    Insert: {
      id?: string; user_id: string; title: string; date: string;
      type: string; icon_name: string; color: string; created_at?: string;
    };
    Update: {
      id?: string; user_id?: string; title?: string; date?: string;
      type?: string; icon_name?: string; color?: string; created_at?: string;
    };
  };
};

// 确保 Json 类型被使用（避免 tree-shaking 问题）
export type { Json };
