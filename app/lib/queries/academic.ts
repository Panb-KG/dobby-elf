/**
 * 课程 & 知识图谱 & 实时订阅
 */

import { requireSupabaseClient } from '../supabase';

// ============================================
// 课程操作
// ============================================

export async function getCourses(userId: string) {
  const supabase = requireSupabaseClient();
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
  const supabase = requireSupabaseClient();
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
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCourse(id: string) {
  const supabase = requireSupabaseClient();
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
  const supabase = requireSupabaseClient();
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
  const supabase = requireSupabaseClient();
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
  const supabase = requireSupabaseClient();
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
