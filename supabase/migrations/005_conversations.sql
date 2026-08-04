-- 会话管理系统
-- Migration 005

-- ===== 会话表（如已存在则跳过） =====
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新对话',
  model TEXT NOT NULL DEFAULT 'qwen3.6-flash',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== 消息表（如已存在则跳过） =====
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  images TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== 索引 =====
CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_msg_user ON messages(user_id);

-- ===== RLS =====
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_all" ON conversations;
DROP POLICY IF EXISTS "messages_all" ON messages;

CREATE POLICY "conversations_all" ON conversations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "messages_all" ON messages
  FOR ALL USING (user_id = auth.uid());

-- ===== 触发器：自动更新 updated_at =====
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_conversations_updated_at') THEN
    CREATE TRIGGER handle_conversations_updated_at
      BEFORE UPDATE ON conversations
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
