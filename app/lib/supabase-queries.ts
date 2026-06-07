/**
 * Supabase 数据查询封装
 * 所有数据操作通过这个函数，统一管理错误处理和类型安全
 */

import { getSupabaseBrowserClient } from './supabase';

// ============================================
// 对话操作
// ============================================

export async function createConversation(
  userId: string,
  title: string = '新对话',
  model: string = 'qwen3.6-flash'
) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, model })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getConversations(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateConversationTitle(id: string, title: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteConversation(id: string) {
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

// ============================================
// 课程操作
// ============================================

export async function getCourses(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function addCourse(
  userId: string,
  course: {
    name: string;
    teacher?: string;
    location?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    color?: string;
  }
) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('courses')
    .insert({
      user_id: userId,
      ...course,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, updates: Partial<{
  name: string;
  teacher: string;
  location: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
}>) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteCourse(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// 知识图谱操作
// ============================================

export async function getKnowledgeNodes(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('knowledge_nodes')
    .select('*')
    .eq('user_id', userId)
    .order('subject', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function upsertKnowledgeNode(
  userId: string,
  subject: string,
  topic: string,
  mastery: number
) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('knowledge_nodes')
    .upsert({
      user_id: userId,
      subject,
      topic,
      mastery,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,subject,topic',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// 实时订阅辅助
// ============================================

export function subscribeToConversations(
  userId: string,
  onUpdate: () => void
) {
  const supabase = getSupabaseBrowserClient();
  return supabase
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`,
      },
      () => onUpdate()
    )
    .subscribe();
}
