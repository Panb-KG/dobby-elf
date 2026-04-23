/**
 * useHomework Hook 测试
 */

import { renderHook, act } from '@testing-library/react';
import { useHomework } from '../app/hooks/useHomework';

describe('useHomework', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该初始化空任务列表', () => {
    const { result } = renderHook(() => useHomework());
    expect(result.current.tasks).toEqual([]);
  });

  it('应该添加任务', () => {
    const { result } = renderHook(() => useHomework());
    
    act(() => {
      result.current.addTask({
        subject: '数学',
        title: '练习册 P50-52',
        status: 'pending',
        dueDate: '2026-04-25',
        image: null,
      });
    });
    
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].subject).toBe('数学');
  });

  it('应该更新任务状态', () => {
    const { result } = renderHook(() => useHomework());
    
    act(() => {
      result.current.addTask({
        subject: '数学',
        title: '练习册 P50-52',
        status: 'pending',
        dueDate: '2026-04-25',
        image: null,
      });
    });
    
    const taskId = result.current.tasks[0].id;
    
    act(() => {
      result.current.updateTaskStatus(taskId, 'completed');
    });
    
    expect(result.current.tasks[0].status).toBe('completed');
  });

  it('应该删除任务', () => {
    const { result } = renderHook(() => useHomework());
    
    act(() => {
      result.current.addTask({
        subject: '数学',
        title: '练习册 P50-52',
        status: 'pending',
        dueDate: '2026-04-25',
        image: null,
      });
    });
    
    const taskId = result.current.tasks[0].id;
    
    act(() => {
      result.current.deleteTask(taskId);
    });
    
    expect(result.current.tasks).toHaveLength(0);
  });

  it('应该按科目筛选任务', () => {
    const { result } = renderHook(() => useHomework());
    
    act(() => {
      result.current.addTask({
        subject: '数学',
        title: '练习册 P50',
        status: 'pending',
        dueDate: '2026-04-25',
        image: null,
      });
      result.current.addTask({
        subject: '语文',
        title: '课文背诵',
        status: 'pending',
        dueDate: '2026-04-26',
        image: null,
      });
    });
    
    const mathTasks = result.current.getTasksBySubject('数学');
    expect(mathTasks).toHaveLength(1);
    expect(mathTasks[0].subject).toBe('数学');
  });

  it('应该检测逾期任务', () => {
    const { result } = renderHook(() => useHomework());
    
    act(() => {
      result.current.addTask({
        subject: '数学',
        title: '逾期作业',
        status: 'pending',
        dueDate: '2020-01-01', // 过去的日期
        image: null,
      });
    });
    
    const overdueTasks = result.current.getOverdueTasks();
    expect(overdueTasks).toHaveLength(1);
  });

  it('应该支持状态过滤', () => {
    const { result } = renderHook(() => useHomework());
    
    act(() => {
      result.current.addTask({
        subject: '数学',
        title: '已完成作业',
        status: 'completed',
        dueDate: '2026-04-25',
        image: null,
      });
      result.current.addTask({
        subject: '语文',
        title: '待完成作业',
        status: 'pending',
        dueDate: '2026-04-26',
        image: null,
      });
    });
    
    act(() => {
      result.current.setFilter('completed');
    });
    
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].status).toBe('completed');
  });
});
