-- ============================================
-- 魔法日记数据表
-- ============================================
-- 创建时间: 2026-07-03
-- 说明: 
--   1. diary_raw - 存储原始输入（语音转文字、图片等）
--   2. diary_processed - 存储 AI 整理后的完整日记
-- ============================================

-- ===== 1. 原始输入表 =====
CREATE TABLE IF NOT EXISTS diary_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 输入类型
  input_type TEXT NOT NULL CHECK (input_type IN ('voice', 'text', 'image')),
  
  -- 原始内容
  raw_content TEXT NOT NULL,
  
  -- 图片 URL 数组
  image_urls TEXT[] DEFAULT '{}',
  
  -- 元数据（JSONB 格式，灵活存储）
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引优化查询
CREATE INDEX idx_diary_raw_user_id ON diary_raw(user_id);
CREATE INDEX idx_diary_raw_created_at ON diary_raw(created_at DESC);
CREATE INDEX idx_diary_raw_metadata_date ON diary_raw USING gin (metadata);

-- 行级安全策略
ALTER TABLE diary_raw ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view their own raw diaries"
  ON diary_raw FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own raw diaries"
  ON diary_raw FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own raw diaries"
  ON diary_raw FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own raw diaries"
  ON diary_raw FOR DELETE
  USING (auth.uid() = user_id);


-- ===== 2. 整理后日记表 =====
CREATE TABLE IF NOT EXISTS diary_processed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diary_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：每个用户每天只能有一篇整理后的日记
  CONSTRAINT unique_user_date UNIQUE (user_id, diary_date),
  
  -- 基本信息
  title TEXT NOT NULL DEFAULT '无标题',
  content TEXT NOT NULL,
  
  -- 多媒体
  images TEXT[] DEFAULT '{}',
  
  -- 标签和分类
  tags TEXT[] DEFAULT '{}',
  subject_links TEXT[] DEFAULT '{}',
  
  -- 情感和天气
  mood TEXT,
  weather TEXT,
  location TEXT,
  
  -- AI 生成的摘要
  ai_summary TEXT
);

-- 索引优化查询
CREATE INDEX idx_diary_processed_user_id ON diary_processed(user_id);
CREATE INDEX idx_diary_processed_diary_date ON diary_processed(diary_date DESC);
CREATE INDEX idx_diary_processed_user_date ON diary_processed(user_id, diary_date DESC);

-- 全文搜索索引
CREATE INDEX idx_diary_processed_search ON diary_processed USING gin (
  to_tsvector('simple', title || ' ' || content)
);

-- 行级安全策略
ALTER TABLE diary_processed ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view their own processed diaries"
  ON diary_processed FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processed diaries"
  ON diary_processed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processed diaries"
  ON diary_processed FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own processed diaries"
  ON diary_processed FOR DELETE
  USING (auth.uid() = user_id);


-- ===== 3. 自动更新 updated_at 的触发器 =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_diary_raw_updated_at
  BEFORE UPDATE ON diary_raw
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_processed_updated_at
  BEFORE UPDATE ON diary_processed
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ===== 4. 注释说明 =====
COMMENT ON TABLE diary_raw IS '魔法日记原始输入表：存储语音转文字、图片等原始数据';
COMMENT ON TABLE diary_processed IS '魔法日记整理表：存储 AI 整理后的完整日记';

COMMENT ON COLUMN diary_raw.input_type IS '输入类型：voice(语音)、text(文字)、image(图片)';
COMMENT ON COLUMN diary_raw.raw_content IS '原始内容：语音转文字的结果或用户输入的文本';
COMMENT ON COLUMN diary_raw.image_urls IS '图片 URL 数组';
COMMENT ON COLUMN diary_raw.metadata IS '元数据：包含 date、title、mood、weather、voice_duration 等';

COMMENT ON COLUMN diary_processed.diary_date IS '日记日期：每篇日记对应的日期';
COMMENT ON COLUMN diary_processed.title IS '日记标题：AI 生成或用户编辑的标题';
COMMENT ON COLUMN diary_processed.content IS '日记正文：AI 整理后的完整内容';
COMMENT ON COLUMN diary_processed.images IS '精选图片：从原始输入中选择的图片';
COMMENT ON COLUMN diary_processed.tags IS '标签数组：如 #深圳 #人才公园 #科技';
COMMENT ON COLUMN diary_processed.subject_links IS '学科链接：如 历史/科技/文化/生物/物理等';
COMMENT ON COLUMN diary_processed.mood IS '情感：emoji 表示的心情';
COMMENT ON COLUMN diary_processed.weather IS '天气：emoji 表示的天气';
COMMENT ON COLUMN diary_processed.location IS '地点：如 深圳人才公园';
COMMENT ON COLUMN diary_processed.ai_summary IS 'AI 摘要：对日记内容的简短总结';
