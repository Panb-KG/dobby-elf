-- 长期记忆系统
-- Migration 007

-- ===== 记忆表 =====
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- TEXT 类型，兼容本地回退模式
  
  -- 记忆内容
  content TEXT NOT NULL,          -- 记忆文本，如"Leon 三年级，喜欢奥数"
  
  -- 分类（用于检索过滤）
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'user_profile',     -- 用户画像（年龄、年级、姓名等）
    'learning_pref',     -- 学习偏好（喜欢的学科、学习方式等）
    'important_event',   -- 重要事件（夏令营、比赛等）
    'conversation_habit',-- 对话习惯（常用语气、话题倾向等）
    'general'           -- 其他
  )),
  
  -- 来源信息
  source_conversation_id TEXT,    -- 来源会话 ID
  source_message_id TEXT,         -- 来源消息 ID
  
  -- 元数据
  confidence FLOAT DEFAULT 1.0,   -- 置信度（0-1），AI 提取时的把握程度
  tags TEXT[],                    -- 标签，用于快速检索
  
  -- 状态
  is_active BOOLEAN DEFAULT true, -- 是否有效（可手动标记为无效）
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== 索引 =====
CREATE INDEX IF NOT EXISTS idx_mem_user ON memories(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_mem_category ON memories(user_id, category);
CREATE INDEX IF NOT EXISTS idx_mem_tags ON memories USING GIN(tags);

-- ===== RLS =====
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memories_all" ON memories;

CREATE POLICY "memories_all" ON memories
  FOR ALL USING (user_id = auth.uid()::text);

-- ===== 触发器：自动更新 updated_at =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_memories_updated_at') THEN
    CREATE TRIGGER handle_memories_updated_at
      BEFORE UPDATE ON memories
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
