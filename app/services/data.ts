import { error as logError } from '../lib/console';
import { User, Course, Achievement, KnowledgePoint, DailyTask, HomeworkTask, HomeworkStatus } from './types';
import { getSupabaseBrowserClient } from '../lib/supabase';

export class DataService {
  private static instance: DataService;

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // ========== 用户 ==========

  async getUser(userId: string): Promise<User | null> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error || !data) return null;
      return this.profileToUser(data);
    } catch (err) {
      logError('Failed to get user:', err);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update(this.userToProfileUpdates(updates))
        .eq('id', userId);
      if (error) logError('Failed to update user:', error.message);
    } catch (err) {
      logError('Failed to update user:', err);
    }
  }

  // ========== 课程表 ==========

  async getCourses(userId: string): Promise<Course[]> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId);
      if (error) {
        logError('Failed to get courses:', error.message);
        return [];
      }
      return (data || []).map(this.courseFromDb);
    } catch (err) {
      logError('Failed to get courses:', err);
      return [];
    }
  }

  async saveCourse(userId: string, course: Course): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const dbCourse = this.courseToDb(course, userId);
      if (course.id) {
        const { error } = await supabase
          .from('courses')
          .update(dbCourse)
          .eq('id', course.id)
          .eq('user_id', userId);
        if (error) logError('Failed to update course:', error.message);
      } else {
        const { error } = await supabase
          .from('courses')
          .insert({ ...dbCourse, user_id: userId });
        if (error) logError('Failed to insert course:', error.message);
      }
    } catch (err) {
      logError('Failed to save course:', err);
    }
  }

  async deleteCourse(userId: string, courseId: string): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('user_id', userId);
      if (error) logError('Failed to delete course:', error.message);
    } catch (err) {
      logError('Failed to delete course:', err);
    }
  }

  // ========== 成就 ==========

  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);
      if (error) {
        logError('Failed to get achievements:', error.message);
        return [];
      }
      return (data || []).map(this.achievementFromDb);
    } catch (err) {
      logError('Failed to get achievements:', err);
      return [];
    }
  }

  async saveAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('achievements')
        .insert(this.achievementToDb(achievement, userId));
      if (error) logError('Failed to save achievement:', error.message);
    } catch (err) {
      logError('Failed to save achievement:', err);
    }
  }

  // ========== 知识图谱 ==========

  async getKnowledgeGraph(userId: string): Promise<KnowledgePoint[]> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('knowledge_nodes')
        .select('*')
        .eq('user_id', userId);
      if (error) {
        logError('Failed to get knowledge graph:', error.message);
        return [];
      }
      return (data || []).map(this.knowledgePointFromDb);
    } catch (err) {
      logError('Failed to get knowledge graph:', err);
      return [];
    }
  }

  async saveKnowledgeGraph(userId: string, points: KnowledgePoint[]): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      // 先删后插（简单粗暴）
      await supabase.from('knowledge_nodes').delete().eq('user_id', userId);
      if (points.length > 0) {
        const { error } = await supabase
          .from('knowledge_nodes')
          .insert(points.map(p => this.knowledgePointToDb(p, userId)));
        if (error) logError('Failed to save knowledge graph:', error.message);
      }
    } catch (err) {
      logError('Failed to save knowledge graph:', err);
    }
  }

  // ========== 待办任务 ==========

  async getDailyTasks(userId: string): Promise<DailyTask[]> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId);
      if (error) return [];
      return (data || []).map(t => ({
        id: t.id as string,
        text: t.text as string,
        completed: t.completed as boolean,
        reward: (t.reward as number) || 0,
      }));
    } catch (err) {
      logError('Failed to get daily tasks:', err);
      return [];
    }
  }

  async saveDailyTask(userId: string, task: DailyTask): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('daily_tasks')
        .insert({
          user_id: userId,
          text: task.text,
          completed: task.completed || false,
          reward: task.reward || 0,
        });
      if (error) logError('Failed to save daily task:', error.message);
    } catch (err) {
      logError('Failed to save daily task:', err);
    }
  }

  async updateDailyTask(userId: string, taskId: string, updates: Partial<DailyTask>): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('daily_tasks')
        .update({
          ...(updates.text !== undefined && { text: updates.text }),
          ...(updates.completed !== undefined && { completed: updates.completed }),
          ...(updates.reward !== undefined && { reward: updates.reward }),
        })
        .eq('id', taskId)
        .eq('user_id', userId);
      if (error) logError('Failed to update daily task:', error.message);
    } catch (err) {
      logError('Failed to update daily task:', err);
    }
  }

  async deleteDailyTask(userId: string, taskId: string): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);
      if (error) logError('Failed to delete daily task:', error.message);
    } catch (err) {
      logError('Failed to delete daily task:', err);
    }
  }

  // ========== 作业 ==========

  async getHomework(userId: string): Promise<HomeworkTask[]> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('user_id', userId);
      if (error) return [];
      return (data || []).map(this.homeworkFromDb);
    } catch (err) {
      logError('Failed to get homework:', err);
      return [];
    }
  }

  async saveHomework(userId: string, homework: HomeworkTask): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('homework')
        .insert(this.homeworkToDb(homework, userId));
      if (error) logError('Failed to save homework:', error.message);
    } catch (err) {
      logError('Failed to save homework:', err);
    }
  }

  async updateHomework(userId: string, homeworkId: string, updates: Partial<HomeworkTask>): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('homework')
        .update(this.homeworkUpdatesToDb(updates))
        .eq('id', homeworkId)
        .eq('user_id', userId);
      if (error) logError('Failed to update homework:', error.message);
    } catch (err) {
      logError('Failed to update homework:', err);
    }
  }

  async deleteHomework(userId: string, homeworkId: string): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId)
        .eq('user_id', userId);
      if (error) logError('Failed to delete homework:', error.message);
    } catch (err) {
      logError('Failed to delete homework:', err);
    }
  }

  // ========== 类型转换 ==========

  private profileToUser(profile: Record<string, unknown>): User {
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

  private userToProfileUpdates(user: Partial<User>): Record<string, unknown> {
    const updates: Record<string, unknown> = {};
    if (user.displayName !== undefined) updates.display_name = user.displayName;
    if (user.points !== undefined) updates.points = user.points;
    if (user.level !== undefined) updates.level = parseInt(String(user.level)) || 1;
    if (user.treeGrowth !== undefined) updates.tree_growth = user.treeGrowth;
    if (user.grade !== undefined) updates.grade = user.grade ? parseInt(user.grade) : null;
    return updates;
  }

  private courseFromDb(row: Record<string, unknown>): Course {
    // courses 表字段：id, user_id, name, teacher, location, day_of_week, start_time, end_time, color
    const dayMap: string[] = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return {
      id: row.id as string,
      day: dayMap[(row.day_of_week as number) || 1] || '周一',
      subject: (row.name as string) || '',
      time: `${(row.start_time as string)?.slice(0, 5) || ''} - ${(row.end_time as string)?.slice(0, 5) || ''}`,
      type: '校内', // 默认，可根据需要改
      color: (row.color as string) || '#4ECDC4',
    };
  }

  private courseToDb(course: Course, userId: string): Record<string, unknown> {
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

  private achievementFromDb(row: Record<string, unknown>): Achievement {
    return {
      id: row.id as string,
      title: (row.title as string) || '',
      date: (row.date as string) || '',
      type: (row.type as string) || '',
      iconName: (row.icon_name as string) || '',
      color: (row.color as string) || '',
    };
  }

  private achievementToDb(a: Achievement, userId: string): Record<string, unknown> {
    return {
      user_id: userId,
      title: a.title,
      date: a.date,
      type: a.type,
      icon_name: a.iconName,
      color: a.color,
    };
  }

  private knowledgePointFromDb(row: Record<string, unknown>): KnowledgePoint {
    return {
      name: (row.topic as string) || '',
      status: (row.mastery as number) >= 80 ? 'mastered' : 'learning',
      subject: (row.subject as string) || '',
    };
  }

  private knowledgePointToDb(kp: KnowledgePoint, userId: string): Record<string, unknown> {
    return {
      user_id: userId,
      subject: kp.subject,
      topic: kp.name,
      mastery: kp.status === 'mastered' ? 100 : 50,
    };
  }

  private homeworkFromDb(row: Record<string, unknown>): HomeworkTask {
    return {
      id: row.id as string,
      subject: (row.subject as string) || '',
      title: (row.title as string) || '',
      status: (row.status as HomeworkStatus) || 'pending',
      dueDate: (row.due_date as string) || '',
      image: null,
    };
  }

  private homeworkToDb(hw: HomeworkTask, userId: string): Record<string, unknown> {
    return {
      user_id: userId,
      title: hw.title,
      subject: hw.subject,
      description: '',
      due_date: hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : null,
      status: hw.status || 'pending',
    };
  }

  private homeworkUpdatesToDb(updates: Partial<HomeworkTask>): Record<string, unknown> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dueDate !== undefined) dbUpdates.due_date = new Date(updates.dueDate).toISOString().split('T')[0];
    return dbUpdates;
  }
}

export const dataService = DataService.getInstance();
