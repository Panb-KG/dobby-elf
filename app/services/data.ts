import { error as logError } from '../lib/console';
import { User, Course, Achievement, KnowledgePoint, DailyTask, HomeworkTask } from './types';
import { requireSupabaseClient } from '../lib/supabase';
import {
  profileToUser, userToProfileUpdates,
  courseFromDb, courseToDb,
  achievementFromDb, achievementToDb,
  knowledgePointFromDb, knowledgePointToDb,
  homeworkFromDb, homeworkToDb, homeworkUpdatesToDb,
} from './data-converters';

export class DataService {
  private static instance: DataService;

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) DataService.instance = new DataService();
    return DataService.instance;
  }

  // ========== 用户 ==========

  async getUser(userId: string): Promise<User | null> {
    try {
      const supabase = requireSupabaseClient();
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error || !data) return null;
      return profileToUser(data);
    } catch (err) { logError('Failed to get user:', err); return null; }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('profiles').update(userToProfileUpdates(updates)).eq('id', userId);
      if (error) logError('Failed to update user:', error.message);
    } catch (err) { logError('Failed to update user:', err); }
  }

  // ========== 课程表 ==========

  async getCourses(userId: string): Promise<Course[]> {
    try {
      const supabase = requireSupabaseClient();
      const { data, error } = await supabase.from('courses').select('*').eq('user_id', userId);
      if (error) { logError('Failed to get courses:', error.message); return []; }
      return (data || []).map(courseFromDb);
    } catch (err) { logError('Failed to get courses:', err); return []; }
  }

  async saveCourse(userId: string, course: Course): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const dbCourse = courseToDb(course, userId);
      if (course.id) {
        const { error } = await supabase.from('courses').update(dbCourse).eq('id', course.id).eq('user_id', userId);
        if (error) logError('Failed to update course:', error.message);
      } else {
        const { error } = await supabase.from('courses').insert({ ...dbCourse, user_id: userId });
        if (error) logError('Failed to insert course:', error.message);
      }
    } catch (err) { logError('Failed to save course:', err); }
  }

  async deleteCourse(userId: string, courseId: string): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('courses').delete().eq('id', courseId).eq('user_id', userId);
      if (error) logError('Failed to delete course:', error.message);
    } catch (err) { logError('Failed to delete course:', err); }
  }

  // ========== 成就 ==========

  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const supabase = requireSupabaseClient();
      const { data, error } = await supabase.from('achievements').select('*').eq('user_id', userId);
      if (error) { logError('Failed to get achievements:', error.message); return []; }
      return (data || []).map(achievementFromDb);
    } catch (err) { logError('Failed to get achievements:', err); return []; }
  }

  async saveAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('achievements').insert(achievementToDb(achievement, userId));
      if (error) logError('Failed to save achievement:', error.message);
    } catch (err) { logError('Failed to save achievement:', err); }
  }

  // ========== 知识图谱 ==========

  async getKnowledgeGraph(userId: string): Promise<KnowledgePoint[]> {
    try {
      const supabase = requireSupabaseClient();
      const { data, error } = await supabase.from('knowledge_nodes').select('*').eq('user_id', userId);
      if (error) { logError('Failed to get knowledge graph:', error.message); return []; }
      return (data || []).map(knowledgePointFromDb);
    } catch (err) { logError('Failed to get knowledge graph:', err); return []; }
  }

  async saveKnowledgeGraph(userId: string, points: KnowledgePoint[]): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      await supabase.from('knowledge_nodes').delete().eq('user_id', userId);
      if (points.length > 0) {
        const { error } = await supabase.from('knowledge_nodes').insert(points.map(p => knowledgePointToDb(p, userId)));
        if (error) logError('Failed to save knowledge graph:', error.message);
      }
    } catch (err) { logError('Failed to save knowledge graph:', err); }
  }

  // ========== 待办任务 ==========

  async getDailyTasks(userId: string): Promise<DailyTask[]> {
    try {
      const supabase = requireSupabaseClient();
      const { data, error } = await supabase.from('daily_tasks').select('*').eq('user_id', userId);
      if (error) return [];
      return (data || []).map(t => ({
        id: t.id as string, text: t.text as string,
        completed: t.completed as boolean, reward: (t.reward as number) || 0,
      }));
    } catch (err) { logError('Failed to get daily tasks:', err); return []; }
  }

  async saveDailyTask(userId: string, task: DailyTask): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('daily_tasks').insert({
        user_id: userId, text: task.text, completed: task.completed || false, reward: task.reward || 0,
      });
      if (error) logError('Failed to save daily task:', error.message);
    } catch (err) { logError('Failed to save daily task:', err); }
  }

  async updateDailyTask(userId: string, taskId: string, updates: Partial<DailyTask>): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('daily_tasks').update({
        ...(updates.text !== undefined && { text: updates.text }),
        ...(updates.completed !== undefined && { completed: updates.completed }),
        ...(updates.reward !== undefined && { reward: updates.reward }),
      }).eq('id', taskId).eq('user_id', userId);
      if (error) logError('Failed to update daily task:', error.message);
    } catch (err) { logError('Failed to update daily task:', err); }
  }

  async deleteDailyTask(userId: string, taskId: string): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId).eq('user_id', userId);
      if (error) logError('Failed to delete daily task:', error.message);
    } catch (err) { logError('Failed to delete daily task:', err); }
  }

  // ========== 作业 ==========

  async getHomework(userId: string): Promise<HomeworkTask[]> {
    try {
      const supabase = requireSupabaseClient();
      const { data, error } = await supabase.from('homework').select('*').eq('user_id', userId);
      if (error) return [];
      return (data || []).map(homeworkFromDb);
    } catch (err) { logError('Failed to get homework:', err); return []; }
  }

  async saveHomework(userId: string, homework: HomeworkTask): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('homework').insert(homeworkToDb(homework, userId));
      if (error) logError('Failed to save homework:', error.message);
    } catch (err) { logError('Failed to save homework:', err); }
  }

  async updateHomework(userId: string, homeworkId: string, updates: Partial<HomeworkTask>): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('homework').update(homeworkUpdatesToDb(updates)).eq('id', homeworkId).eq('user_id', userId);
      if (error) logError('Failed to update homework:', error.message);
    } catch (err) { logError('Failed to update homework:', err); }
  }

  async deleteHomework(userId: string, homeworkId: string): Promise<void> {
    try {
      const supabase = requireSupabaseClient();
      const { error } = await supabase.from('homework').delete().eq('id', homeworkId).eq('user_id', userId);
      if (error) logError('Failed to delete homework:', error.message);
    } catch (err) { logError('Failed to delete homework:', err); }
  }
}

export const dataService = DataService.getInstance();
