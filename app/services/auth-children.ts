/**
 * 子账号管理 - 从 auth.ts 提取
 */

import { ChildAccount } from '../types';
import { requireSupabaseClient } from '../lib/supabase';

export async function getChildren(parentId: string): Promise<ChildAccount[]> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);

  return (data || []).map(p => ({
    id: p.id as string,
    username: p.username as string,
    displayName: (p.display_name as string) || (p.username as string) || '',
    childName: (p.child_name as string) || '',
    grade: p.grade ? String(p.grade) : '',
    pinCode: (p.pin_code as string) || '',
    avatarUrl: (p.avatar_url as string) || '',
    isActive: (p.is_active as boolean) !== false,
    points: (p.points as number) || 0,
    level: String(p.level || 1),
    treeGrowth: (p.tree_growth as number) || 0,
    createdAt: (p.created_at as string) || '',
  }));
}

export async function createChild(
  parentId: string,
  childName: string,
  grade: string,
  pinCode: string,
  avatarUrl?: string,
): Promise<ChildAccount> {
  const supabase = requireSupabaseClient();
  const username = `child_${Date.now()}_${(Math.random() * 1000).toFixed(0)}`;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      username,
      display_name: childName,
      child_name: childName,
      grade: parseInt(grade) || null,
      pin_code: pinCode,
      parent_id: parentId,
      role: 'child',
      points: 0, level: 1, tree_growth: 0, is_active: true,
      avatar_url: avatarUrl || null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || '创建孩子账号失败');

  return {
    id: data.id as string,
    username: data.username as string,
    displayName: (data.display_name as string) || '',
    childName: (data.child_name as string) || '',
    grade: data.grade ? String(data.grade) : '',
    pinCode: (data.pin_code as string) || '',
    avatarUrl: (data.avatar_url as string) || '',
    isActive: true, points: 0, level: '1', treeGrowth: 0,
    createdAt: data.created_at as string,
  };
}

export async function updateChild(
  childId: string,
  updates: Partial<{
    childName: string; grade: string; pinCode: string; isActive: boolean; avatarUrl: string;
  }>,
): Promise<void> {
  const supabase = requireSupabaseClient();
  const updateData: Record<string, unknown> = {};
  if (updates.childName !== undefined) {
    updateData.child_name = updates.childName;
    updateData.display_name = updates.childName;
  }
  if (updates.grade !== undefined) updateData.grade = parseInt(updates.grade) || null;
  if (updates.pinCode !== undefined) updateData.pin_code = updates.pinCode;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

  const { error } = await supabase.from('profiles').update(updateData).eq('id', childId);
  if (error) throw new Error(error.message);
}

export async function deactivateChild(childId: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', childId);
  if (error) throw new Error(error.message);
}
