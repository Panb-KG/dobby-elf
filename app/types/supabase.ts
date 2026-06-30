/**
 * Supabase 数据库类型定义
 * 匹配 supabase/schema-full.sql + migration.sql 最终状态
 *
 * 表类型已拆分到：
 * - supabase-tables-core.ts (profiles, daily_tasks, conversations, messages)
 * - supabase-tables-extra.ts (courses, knowledge_nodes, exercises, homework, achievements)
 */

export type { Json } from './supabase-tables-core';
import type { CoreTables } from './supabase-tables-core';
import type { ExtraTables } from './supabase-tables-extra';

export interface Database {
  public: {
    Tables: CoreTables & ExtraTables;
    Views: {};
    Functions: {};
  };
}
