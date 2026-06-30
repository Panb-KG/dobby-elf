/**
 * 对话 & 消息操作
 */

import { requireSupabaseClient } from '../supabase';

// ============================================
// 对话操作
// ============================================

export async function createConversation(
  userId: string,
  title: string = '新对话',
  model: string = 'qwen3.6-flash'
) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, model })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversations(userId: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateConversationTitle(id: string, title: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteConversation(id: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// 消息操作
// ============================================

export async function addMessage(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  images?: string[]
) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
      images: images || null,
    })
    .select()
    .single();

  if (error) throw error;

  // 更新对话的 updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

export async function getMessages(conversationId: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}
