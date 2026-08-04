-- 修复会话表 user_id 类型兼容性（支持本地回退模式）
-- Migration 006

-- ===== 先删除所有 RLS 策略 =====
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'conversations'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON conversations';
    END LOOP;
    
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'messages'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON messages';
    END LOOP;
END $$;

-- ===== 修改 conversations 表 =====
ALTER TABLE conversations ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

-- ===== 修改 messages 表 =====
ALTER TABLE messages ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE messages ALTER COLUMN conversation_id TYPE TEXT;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- ===== 重建索引 =====
DROP INDEX IF EXISTS idx_conv_user;
CREATE INDEX idx_conv_user ON conversations(user_id, updated_at DESC);

DROP INDEX IF EXISTS idx_msg_conv;
CREATE INDEX idx_msg_conv ON messages(conversation_id, created_at ASC);

DROP INDEX IF EXISTS idx_msg_user;
CREATE INDEX idx_msg_user ON messages(user_id);

-- ===== 重建 RLS 策略 =====
CREATE POLICY "conversations_all" ON conversations
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "messages_all" ON messages
  FOR ALL USING (user_id = auth.uid()::text);
