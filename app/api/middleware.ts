/**
 * 通用 API 中间件
 * 提供 user_id 校验、标准错误响应等共用逻辑
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 从请求中提取 user_id
 * 优先从 searchParams 取，其次从 JSON body 取
 */
export function getUserId(
  request: NextRequest,
  options?: { fromBody?: boolean }
): string | null {
  const { searchParams } = new URL(request.url);
  const fromQuery = searchParams.get('user_id');
  if (fromQuery) return fromQuery;

  if (options?.fromBody) {
    // 注意：body 只能读取一次，调用方需确保一致
    // 此方法仅供同步校验场景，POST/PUT 的 body 应由调用方自行解析
  }
  return null;
}

/**
 * 校验 user_id 是否存在，不存在则返回标准 400 响应
 */
export function requireUserId(
  request: NextRequest,
  options?: { fromBody?: boolean; message?: string }
): { userId: string } | NextResponse {
  const userId = getUserId(request, options);
  if (!userId) {
    return NextResponse.json(
      { error: options?.message || '缺少 user_id' },
      { status: 400 }
    );
  }
  return { userId };
}

/**
 * 校验必填字段
 */
export function requireFields(
  body: Record<string, unknown>,
  fields: string[]
): string[] | null {
  const missing = fields.filter((f) => !body[f]);
  return missing.length > 0 ? missing : null;
}

/**
 * 标准错误响应
 */
export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Supabase 客户端可用性检查
 */
export function checkSupabase(client: unknown): NextResponse | null {
  if (!client) {
    return NextResponse.json({ error: 'Supabase 未配置' }, { status: 503 });
  }
  return null;
}
