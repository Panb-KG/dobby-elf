/**
 * 成就 & 练习题操作
 */

import { requireSupabaseClient } from '../supabase';

// ============================================
// 成就操作
// ============================================

export async function getAchievements(userId: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function unlockAchievement(
  userId: string,
  achievement: {
    title: string;
    date: string;
    type: string;
    icon_name: string;
    color: string;
  }
) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      ...achievement,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAchievement(id: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// 练习题操作
// ============================================

export async function getExercises(userId: string, conversationId?: string) {
  const supabase = requireSupabaseClient();
  let query = supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (conversationId) {
    query = query.eq('conversation_id', conversationId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function addExercise(
  userId: string,
  exercise: {
    conversation_id?: string;
    subject: string;
    question: string;
    answer?: string;
    user_answer?: string;
    is_correct?: boolean;
  }
) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: userId,
      ...exercise,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExerciseResult(
  id: string,
  userAnswer: string,
  isCorrect: boolean
) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase
    .from('exercises')
    .update({
      user_answer: userAnswer,
      is_correct: isCorrect,
    })
    .eq('id', id);

  if (error) throw error;
}
