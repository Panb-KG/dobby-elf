/**
 * 输入校验工具测试
 */
import { describe, it, expect } from 'vitest';
import { validateBody, validators } from '../app/lib/validate';

describe('validateBody', () => {
  it('应该通过有效数据', () => {
    const result = validateBody(
      { name: '测试', age: 25 },
      [
        { field: 'name', required: true, type: 'string', min: 1, max: 50 },
        { field: 'age', required: true, type: 'number', min: 0, max: 150 },
      ]
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('应该拒绝缺少必填字段', () => {
    const result = validateBody(
      { name: '测试' },
      [
        { field: 'name', required: true, type: 'string' },
        { field: 'email', required: true, type: 'string' },
      ]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('email 是必填字段');
  });

  it('应该拒绝类型不匹配', () => {
    const result = validateBody(
      { age: 'not a number' },
      [{ field: 'age', required: true, type: 'number' }]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('age 必须是 number 类型');
  });

  it('应该检查字符串长度', () => {
    const result = validateBody(
      { name: '' },
      [{ field: 'name', type: 'string', min: 1 }]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('name 长度不能少于 1 个字符');
  });

  it('应该检查数字范围', () => {
    const result = validateBody(
      { score: 150 },
      [{ field: 'score', required: true, type: 'number', max: 100 }]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('score 不能大于 100');
  });

  it('应该检查数组长度', () => {
    const result = validateBody(
      { items: [1, 2, 3, 4, 5] },
      [{ field: 'items', required: true, type: 'array', max: 3 }]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('items 最多只能有 3 项');
  });

  it('应该检查枚举值', () => {
    const result = validateBody(
      { status: 'invalid' },
      [{ field: 'status', required: true, values: ['active', 'inactive'] }]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('status 必须是 active / inactive 之一');
  });

  it('应该允许可选字段为空', () => {
    const result = validateBody(
      { name: '测试' },
      [{ field: 'bio', type: 'string' }]
    );
    expect(result.valid).toBe(true);
  });

  it('应该验证正则表达式', () => {
    const result = validateBody(
      { email: 'not-an-email' },
      [{ field: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('email 格式不正确');
  });
});

describe('validators 预设', () => {
  it('requiredString 应该创建必填字符串规则', () => {
    const rule = validators.requiredString('title', 100);
    expect(rule).toEqual({
      field: 'title',
      required: true,
      type: 'string',
      max: 100,
    });
  });

  it('optionalString 应该创建可选字符串规则', () => {
    const rule = validators.optionalString('description');
    expect(rule).toEqual({
      field: 'description',
      type: 'string',
      max: 1000,
    });
  });

  it('requiredArray 应该创建必填数组规则', () => {
    const rule = validators.requiredArray('tags', 10);
    expect(rule).toEqual({
      field: 'tags',
      required: true,
      type: 'array',
      max: 10,
    });
  });

  it('messagesArray 应该创建消息数组规则', () => {
    const rule = validators.messagesArray();
    expect(rule).toEqual({
      field: 'messages',
      required: true,
      type: 'array',
      min: 1,
      max: 50,
    });
  });
});
