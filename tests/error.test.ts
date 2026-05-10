/**
 * 错误处理工具测试
 */
import { describe, it, expect } from 'vitest';
import { getErrorMessage, isError } from '../app/lib/error';

describe('getErrorMessage', () => {
  it('应该从 Error 对象提取消息', () => {
    const error = new Error('Something went wrong');
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('应该原样返回字符串', () => {
    expect(getErrorMessage('Plain error string')).toBe('Plain error string');
  });

  it('应该将其他类型转为字符串', () => {
    expect(getErrorMessage(42)).toBe('42');
    expect(getErrorMessage(null)).toBe('null');
    expect(getErrorMessage(undefined)).toBe('undefined');
    expect(getErrorMessage({ code: 500 })).toBe('[object Object]');
  });

  it('应该处理自定义错误类', () => {
    class CustomError extends Error {
      constructor(message: string, public code: number) {
        super(message);
      }
    }
    const error = new CustomError('Custom error', 500);
    expect(getErrorMessage(error)).toBe('Custom error');
  });
});

describe('isError', () => {
  it('应该识别 Error 实例', () => {
    expect(isError(new Error('test'))).toBe(true);
    expect(isError(new TypeError('test'))).toBe(true);
  });

  it('应该拒绝非 Error 值', () => {
    expect(isError('error string')).toBe(false);
    expect(isError(42)).toBe(false);
    expect(isError(null)).toBe(false);
    expect(isError(undefined)).toBe(false);
    expect(isError({ message: 'fake error' })).toBe(false);
  });
});
