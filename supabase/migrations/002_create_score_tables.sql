-- ============================================
-- 亲子打分数据表
-- ============================================
-- 创建时间: 2026-07-04
-- 说明: 
--   1. score_rules - 打分规则
--   2. score_daily - 每日打分记录
-- ============================================

-- ===== 1. 打分规则表 =====
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

CREATE INDEX IF NOT EXISTS idx_score_rules_user_id ON score_rules(user_id);

ALTER TABLE score_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_rules_select_own" ON score_rules;
CREATE POLICY "score_rules_select_own" ON score_rules FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_rules_insert_own" ON score_rules;
CREATE POLICY "score_rules_insert_own" ON score_rules FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_rules_update_own" ON score_rules;
CREATE POLICY "score_rules_update_own" ON score_rules FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_rules_delete_own" ON score_rules;
CREATE POLICY "score_rules_delete_own" ON score_rules FOR DELETE USING (auth.uid() = user_id);

-- ===== 2. 每日打分记录表 =====
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

CREATE INDEX IF NOT EXISTS idx_score_daily_user_date ON score_daily(user_id, date);

ALTER TABLE score_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_daily_select_own" ON score_daily;
CREATE POLICY "score_daily_select_own" ON score_daily FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_daily_insert_own" ON score_daily;
CREATE POLICY "score_daily_insert_own" ON score_daily FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_daily_update_own" ON score_daily;
CREATE POLICY "score_daily_update_own" ON score_daily FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "score_daily_delete_own" ON score_daily;
CREATE POLICY "score_daily_delete_own" ON score_daily FOR DELETE USING (auth.uid() = user_id);

-- ===== 3. RPC: 建表函数（供 ensureScoreTables 调用）=====
CREATE OR REPLACE FUNCTION create_score_tables_if_not_exists()
RETURNS void AS $$
BEGIN
  -- 此函数由迁移脚本创建，调用时由 service role 执行
  -- 表已通过迁移创建，此函数仅作为安全检查
  PERFORM 1 FROM score_rules LIMIT 1;
  PERFORM 1 FROM score_daily LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
