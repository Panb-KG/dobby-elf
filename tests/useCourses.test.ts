/**
 * useCourses Hook 测试
 */

import { renderHook, act } from '@testing-library/react';
import { useCourses } from '../app/hooks/useCourses';

describe('useCourses', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该初始化空课程列表', () => {
    const { result } = renderHook(() => useCourses());
    expect(result.current.courses).toEqual([]);
  });

  it('应该支持初始课程', () => {
    const initialCourses = [
      { id: '1', day: '周一', subject: '数学', time: '08:00', type: '校内' as const, color: 'bg-blue-500' },
    ];
    
    const { result } = renderHook(() => useCourses({ initialCourses }));
    expect(result.current.courses).toHaveLength(1);
  });

  it('应该添加课程', async () => {
    const { result } = renderHook(() => useCourses());
    
    // 使用 waitForNextUpdate 等待初始渲染
    await new Promise(resolve => setTimeout(resolve, 0));
    
    act(() => {
      // 直接传入完整的课程数据，而不是先 setNewCourse 再 addCourse
      result.current.setNewCourse({
        day: '周一',
        subject: '数学',
        time: '08:00',
        type: '校内',
      });
    });
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    act(() => {
      result.current.addCourse();
    });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(result.current.courses.length).toBeGreaterThan(0);
    expect(result.current.courses[0]?.subject).toBe('数学');
  });

  it('应该移除课程', () => {
    const initialCourses = [
      { id: '1', day: '周一', subject: '数学', time: '08:00', type: '校内' as const, color: 'bg-blue-500' },
    ];
    
    const { result } = renderHook(() => useCourses({ initialCourses }));
    
    act(() => {
      result.current.removeCourse(0);
    });
    
    expect(result.current.courses).toHaveLength(0);
  });

  it('应该切换视图模式', () => {
    const { result } = renderHook(() => useCourses());
    
    act(() => {
      result.current.setScheduleView('day');
    });
    
    expect(result.current.scheduleView).toBe('day');
  });

  it('应该切换选中日期', () => {
    const { result } = renderHook(() => useCourses());
    
    act(() => {
      result.current.setSelectedDay('周二');
    });
    
    expect(result.current.selectedDay).toBe('周二');
  });

  it('应该自动分配颜色', async () => {
    const { result } = renderHook(() => useCourses());
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    act(() => {
      result.current.setNewCourse({
        day: '周一',
        subject: '数学',
        time: '08:00',
        type: '校内',
      });
    });
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    act(() => {
      result.current.addCourse();
    });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(result.current.courses.length).toBeGreaterThan(0);
    expect(result.current.courses[0]?.color).toBeDefined();
  });

  it('应该验证课程数据', () => {
    const { result } = renderHook(() => useCourses());
    
    act(() => {
      result.current.setNewCourse({
        day: '周一',
        subject: '',
        time: '',
        type: '校内',
      });
      result.current.addCourse();
    });
    
    expect(result.current.courses).toHaveLength(0);
  });
});
