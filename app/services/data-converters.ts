/**
 * 数据类型转换器 - DB 行 ↔ 应用类型
 * 从 services/data.ts 提取
 */

import { User, Course, Achievement, KnowledgePoint, HomeworkTask, HomeworkStatus } from './types';

export function profileToUser(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    username: (profile.username as string) || '',
    displayName: (profile.display_name as string) || (profile.username as string) || '',
    email: (profile.id as string) || '',
    role: (profile.role as User['role']) || 'parent',
    parentId: profile.parent_id as string | undefined,
    childName: profile.child_name as string | undefined,
    grade: profile.grade ? String(profile.grade) : undefined,
    pinCode: profile.pin_code as string | undefined,
    isActive: profile.is_active as boolean | undefined,
    createdAt: (profile.created_at as string) || new Date().toISOString(),
    points: (profile.points as number) || 0,
    level: String(profile.level || 1),
    treeGrowth: (profile.tree_growth as number) || 0,
    dailyTasks: [],
  };
}

export function userToProfileUpdates(user: Partial<User>): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  if (user.displayName !== undefined) updates.display_name = user.displayName;
  if (user.points !== undefined) updates.points = user.points;
  if (user.level !== undefined) updates.level = parseInt(String(user.level)) || 1;
  if (user.treeGrowth !== undefined) updates.tree_growth = user.treeGrowth;
  if (user.grade !== undefined) updates.grade = user.grade ? parseInt(user.grade) : null;
  return updates;
}

export function courseFromDb(row: Record<string, unknown>): Course {
  const dayMap: string[] = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return {
    id: row.id as string,
    day: dayMap[(row.day_of_week as number) || 1] || '周一',
    subject: (row.name as string) || '',
    time: `${(row.start_time as string)?.slice(0, 5) || ''} - ${(row.end_time as string)?.slice(0, 5) || ''}`,
    type: '校内',
    color: (row.color as string) || '#4ECDC4',
  };
}

export function courseToDb(course: Course, _userId: string): Record<string, unknown> {
  const dayReverse: Record<string, number> = { '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7 };
  const [start, end] = (course.time || '').split(' - ');
  return {
    name: course.subject,
    day_of_week: dayReverse[course.day] || 1,
    start_time: start || '08:00',
    end_time: end || '09:00',
    color: course.color || '#4ECDC4',
  };
}

export function achievementFromDb(row: Record<string, unknown>): Achievement {
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    date: (row.date as string) || '',
    type: (row.type as string) || '',
    iconName: (row.icon_name as string) || '',
    color: (row.color as string) || '',
  };
}

export function achievementToDb(a: Achievement, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    title: a.title,
    date: a.date,
    type: a.type,
    icon_name: a.iconName,
    color: a.color,
  };
}

export function knowledgePointFromDb(row: Record<string, unknown>): KnowledgePoint {
  return {
    name: (row.topic as string) || '',
    status: (row.mastery as number) >= 80 ? 'mastered' : 'learning',
    subject: (row.subject as string) || '',
  };
}

export function knowledgePointToDb(kp: KnowledgePoint, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    subject: kp.subject,
    topic: kp.name,
    mastery: kp.status === 'mastered' ? 100 : 50,
  };
}

export function homeworkFromDb(row: Record<string, unknown>): HomeworkTask {
  return {
    id: row.id as string,
    subject: (row.subject as string) || '',
    title: (row.title as string) || '',
    status: (row.status as HomeworkStatus) || 'pending',
    dueDate: (row.due_date as string) || '',
    image: null,
  };
}

export function homeworkToDb(hw: HomeworkTask, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    title: hw.title,
    subject: hw.subject,
    description: '',
    due_date: hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : null,
    status: hw.status || 'pending',
  };
}

export function homeworkUpdatesToDb(updates: Partial<HomeworkTask>): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.dueDate !== undefined) dbUpdates.due_date = new Date(updates.dueDate).toISOString().split('T')[0];
  return dbUpdates;
}
