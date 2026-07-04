/**
 * 一次性设置脚本：创建打分相关的 Supabase 表
 * 
 * 用法: npx tsx scripts/setup-score-tables.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 缺少环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SQL = `
-- 打分规则表
CREATE TABLE IF NOT EXISTS score_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  max_points INTEGER NOT NULL DEFAULT 5,
  icon TEXT DEFAULT '⭐',
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日打分记录表
CREATE TABLE IF NOT EXISTS score_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES score_rules(id) ON DELETE CASCADE,
  rule_title TEXT DEFAULT '',
  rule_icon TEXT DEFAULT '⭐',
  score INTEGER NOT NULL DEFAULT 0,
  comment TEXT DEFAULT '',
  scored_by TEXT DEFAULT 'child',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rule_id, date)
);

-- RLS 策略
ALTER TABLE score_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_daily ENABLE ROW LEVEL SECURITY;

-- score_rules 策略
DROP POLICY IF EXISTS "score_rules_select_own" ON score_rules;
CREATE POLICY "score_rules_select_own" ON score_rules FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_rules_insert_own" ON score_rules;
CREATE POLICY "score_rules_insert_own" ON score_rules FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_rules_update_own" ON score_rules;
CREATE POLICY "score_rules_update_own" ON score_rules FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_rules_delete_own" ON score_rules;
CREATE POLICY "score_rules_delete_own" ON score_rules FOR DELETE USING (auth.uid() = user_id);

-- score_daily 策略
DROP POLICY IF EXISTS "score_daily_select_own" ON score_daily;
CREATE POLICY "score_daily_select_own" ON score_daily FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_daily_insert_own" ON score_daily;
CREATE POLICY "score_daily_insert_own" ON score_daily FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_daily_update_own" ON score_daily;
CREATE POLICY "score_daily_update_own" ON score_daily FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_daily_delete_own" ON score_daily;
CREATE POLICY "score_daily_delete_own" ON score_daily FOR DELETE USING (auth.uid() = user_id);

-- 索引
CREATE INDEX IF NOT EXISTS idx_score_rules_user_id ON score_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_score_daily_user_date ON score_daily(user_id, date);
`;

async function main() {
  console.log('🔧 正在创建打分表...');
  console.log(`   Supabase: ${SUPABASE_URL}`);
  
  const { error } = await supabase.rpc('exec_sql', { sql: SQL });
  
  if (error) {
    // exec_sql 可能不存在，尝试直接建表
    console.log('⚠️  exec_sql RPC 不存在，尝试逐表创建...');
    
    // 尝试直接插入测试数据来验证表是否存在
    // 如果表不存在会报错
    const { error: testError } = await supabase
      .from('score_rules')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      console.error('❌ 表不存在。请在 Supabase Dashboard → SQL Editor 中执行以下 SQL:');
      console.log(SQL);
      process.exit(1);
    } else {
      console.log('✅ 表已存在，无需创建');
    }
  } else {
    console.log('✅ 打分表创建成功！');
  }
}

main().catch(console.error);
