-- 星光档案：成长记录 + 简历生成
-- Migration 004

-- ===== 成长档案表 =====
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 分类
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
    'award',        -- 奖状/荣誉
    'certificate',  -- 证书
    'report_card',  -- 成绩单
    'photo',        -- 重要照片
    'artwork',      -- 作品
    'activity',     -- 活动记录
    'other'         -- 其他
  )),

  -- 基本信息
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  source TEXT,                      -- 来源，如"XX学校"

  -- 文件存储（Supabase Storage path）
  storage_path TEXT,
  thumbnail_path TEXT,
  file_type TEXT,                   -- image/jpeg, application/pdf 等

  -- 标签（用于简历分组）
  tags TEXT[] DEFAULT '{}',

  -- 排序和状态
  is_favorite BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== 简历表 =====
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 用户输入
  purpose TEXT,                     -- 用途，如"小升初择校"
  style TEXT,                       -- 风格，如"简洁正式"
  time_range_start DATE,
  time_range_end DATE,
  extra_prompt TEXT,                -- 其他要求

  -- 生成结果
  title TEXT,                       -- 简历标题
  content TEXT,                     -- 生成的简历文本（Markdown）
  portfolio_item_ids UUID[],        -- 引用的档案项

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== 索引 =====
CREATE INDEX IF NOT EXISTS idx_portfolio_user_date ON portfolio_items(user_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_category ON portfolio_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id, created_at DESC);

-- ===== RLS =====
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "用户管理自己的档案" ON portfolio_items;
DROP POLICY IF EXISTS "用户管理自己的简历" ON resumes;

CREATE POLICY "用户管理自己的档案" ON portfolio_items
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "用户管理自己的简历" ON resumes
  FOR ALL USING (user_id = auth.uid());
