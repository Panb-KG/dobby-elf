/**
 * useLocalStorage Hook 测试
 */

import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../app/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该返回默认值当存储为空时', () => {
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test',
        defaultValue: 'initial',
      })
    );

    expect(result.current[0]).toBe('initial');
  });

  it('应该从 localStorage 读取值', () => {
    localStorage.setItem('dobby_test', JSON.stringify({ value: 'stored', timestamp: Date.now() }));

    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test',
        defaultValue: 'initial',
      })
    );

    expect(result.current[0]).toBe('stored');
  });

  it('应该更新存储值', () => {
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test',
        defaultValue: 'initial',
      })
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('dobby_test') || '')?.value).toBe('updated');
  });

  it('应该支持函数式更新', () => {
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'counter',
        defaultValue: 0,
      })
    );

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('应该支持对象类型', () => {
    const initialSettings = { darkMode: false, fontSize: 14 };
    
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'settings',
        defaultValue: initialSettings,
      })
    );

    act(() => {
      result.current[1]({ darkMode: true, fontSize: 16 });
    });

    expect(result.current[0]).toEqual({ darkMode: true, fontSize: 16 });
  });

  it('应该支持数组类型', () => {
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'courses',
        defaultValue: [],
      })
    );

    act(() => {
      result.current[1]([{ id: '1', subject: '数学' }]);
    });

    expect(result.current[0]).toHaveLength(1);
    expect(result.current[0][0].subject).toBe('数学');
  });

  it('应该支持 remove 方法', () => {
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test',
        defaultValue: 'initial',
      })
    );

    act(() => {
      result.current[1]('updated');
    });
    
    expect(result.current[0]).toBe('updated');

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('initial');
  });

  it('应该支持 TTL 过期', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test',
        defaultValue: 'initial',
        ttl: 1000,
      })
    );

    act(() => {
      result.current[1]('temporary');
    });

    expect(result.current[0]).toBe('temporary');

    // 快进时间
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // 值应该过期并恢复为默认值
    expect(result.current[0]).toBe('initial');
    
    jest.useRealTimers();
  });

  it('应该禁用 SSR 模式', () => {
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test',
        defaultValue: 'initial',
        enabled: false,
      })
    );

    expect(result.current[0]).toBe('initial');
    expect(localStorage.getItem('dobby_test')).toBeNull();
  });

  it('应该调用 onChange 回调', () => {
    const onChange = jest.fn();
    
    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test',
        defaultValue: 'initial',
        onChange,
      })
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(onChange).toHaveBeenCalledWith('updated');
  });
});
