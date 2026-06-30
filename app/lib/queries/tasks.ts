/**
 * 每日任务 & 作业操作
 */

import { requireSupabaseClient } from '../supabase';

// ============================================
// 每日任务操作
// ============================================

export async function getDailyTasks(userId: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addDailyTask(
  userId: string,
  text: string,
  reward: number = 0
) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('daily_tasks')
    .insert({
      user_id: userId,
      text,
      reward,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeTask(taskId: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('daily_tasks')
    .update({ completed: true })
    .eq('id', taskId);

  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('daily_tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

// ============================================
// 作业操作
// ============================================

export async function getHomework(userId: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addHomework(
  userId: string,
  homework: {
    title: string;
    description?: string;
    subject?: string;
    due_date?: string;
    status?: 'pending' | 'in_progress' | 'completed';
  }
) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('homework')
    .insert({
      user_id: userId,
      ...homework,
      status: homework.status || 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHomeworkStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'completed'
) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('homework')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteHomework(id: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('homework')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
