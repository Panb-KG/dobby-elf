/**
 * 输入校验中间件工具
 * 为 API 路由提供统一的请求体验证
 */
import { NextResponse } from 'next/server';

/**
 * 校验规则定义
 */
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  values?: unknown[];
}

/**
 * 校验结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 校验单个字段
 */
function validateField(value: unknown, rule: ValidationRule): string[] {
  const errors: string[] = [];

  // 必填检查
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${rule.field} 是必填字段`);
    return errors;
  }

  // 如果字段不存在且非必填，跳过
  if (value === undefined || value === null) return errors;

  // 类型检查
  if (rule.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rule.type) {
      errors.push(`${rule.field} 必须是 ${rule.type} 类型`);
      return errors;
    }
  }

  // 字符串长度检查
  if (typeof value === 'string') {
    if (rule.min !== undefined && value.length < rule.min) {
      errors.push(`${rule.field} 长度不能少于 ${rule.min} 个字符`);
    }
    if (rule.max !== undefined && value.length > rule.max) {
      errors.push(`${rule.field} 长度不能超过 ${rule.max} 个字符`);
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${rule.field} 格式不正确`);
    }
  }

  // 数字范围检查
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`${rule.field} 不能小于 ${rule.min}`);
    }
    if (rule.max !== undefined && value > rule.max) {
      errors.push(`${rule.field} 不能大于 ${rule.max}`);
    }
  }

  // 数组长度检查
  if (Array.isArray(value)) {
    if (rule.min !== undefined && value.length < rule.min) {
      errors.push(`${rule.field} 至少需要 ${rule.min} 项`);
    }
    if (rule.max !== undefined && value.length > rule.max) {
      errors.push(`${rule.field} 最多只能有 ${rule.max} 项`);
    }
  }

  // 枚举值检查
  if (rule.values && !rule.values.includes(value)) {
    errors.push(`${rule.field} 必须是 ${rule.values.join(' / ')} 之一`);
  }

  return errors;
}

/**
 * 校验请求体
 */
export function validateBody(
  body: Record<string, unknown>,
  rules: ValidationRule[]
): ValidationResult {
  const allErrors: string[] = [];

  for (const rule of rules) {
    const value = body[rule.field];
    const errors = validateField(value, rule);
    allErrors.push(...errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * 校验失败响应
 */
export function validationError(result: ValidationResult): NextResponse {
  return NextResponse.json(
    { error: '参数校验失败', details: result.errors },
    { status: 400 }
  );
}

/**
 * 常用校验规则预设
 */
export const validators = {
  /** 非空字符串 */
  requiredString(field: string, max = 1000): ValidationRule {
    return { field, required: true, type: 'string', max };
  },

  /** 可选字符串 */
  optionalString(field: string, max = 1000): ValidationRule {
    return { field, type: 'string', max };
  },

  /** 非空数组 */
  requiredArray(field: string, max = 100): ValidationRule {
    return { field, required: true, type: 'array', max };
  },

  /** 消息数组（chat API 专用） */
  messagesArray(field = 'messages'): ValidationRule {
    return { field, required: true, type: 'array', min: 1, max: 50 };
  },
};
