-- ============================================
-- 成长之树数据表
-- ============================================
-- 创建时间: 2026-07-26
-- 说明:
--   1. growth_trees - 成长之树状态
--   2. growth_point_records - 积分变动记录
-- ============================================

-- ===== 1. 成长之树状态表 =====
CREATE TABLE IF NOT EXISTS growth_trees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  tree_level INTEGER NOT NULL DEFAULT 1,
  tree_stage TEXT NOT NULL DEFAULT 'seed',
  water_count INTEGER NOT NULL DEFAULT 0,
  last_watered_at TIMESTAMPTZ,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_trees_user_id ON growth_trees(user_id);

ALTER TABLE growth_trees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "growth_trees_select_own" ON growth_trees;
CREATE POLICY "growth_trees_select_own" ON growth_trees FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "growth_trees_insert_own" ON growth_trees;
CREATE POLICY "growth_trees_insert_own" ON growth_trees FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "growth_trees_update_own" ON growth_trees;
CREATE POLICY "growth_trees_update_own" ON growth_trees FOR UPDATE USING (auth.uid() = user_id);

-- ===== 2. 积分变动记录表 =====
CREATE TABLE IF NOT EXISTS growth_point_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT DEFAULT '',
  source TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_point_records_user_id ON growth_point_records(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_point_records_created_at ON growth_point_records(user_id, created_at DESC);

ALTER TABLE growth_point_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "growth_point_records_select_own" ON growth_point_records;
CREATE POLICY "growth_point_records_select_own" ON growth_point_records FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "growth_point_records_insert_own" ON growth_point_records;
CREATE POLICY "growth_point_records_insert_own" ON growth_point_records FOR INSERT WITH CHECK (auth.uid() = user_id);
