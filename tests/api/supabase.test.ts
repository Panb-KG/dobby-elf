/**
 * GET/POST/DELETE /api/supabase 测试
 * 验证 Supabase 代理 API 的参数校验
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn(() => ({ data: { id: '1' }, error: null })),
  })),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
});

describe('GET /api/supabase', () => {
  it('缺 user_id 时返回 400', async () => {
    const { GET } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase?type=conversations') as any;
    const response = await GET(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('缺少 user_id');
  });

  it('缺 type 时返回无效类型错误', async () => {
    const { GET } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase?user_id=u1') as any;
    const response = await GET(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('无效的类型');
  });

  it('查询 conversations 返回数据', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn(() => ({ data: [{ id: 'c1' }], error: null })),
    });
    const { GET } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase?user_id=u1&type=conversations') as any;
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it('messages 缺 conversation_id 时返回 400', async () => {
    const { GET } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase?user_id=u1&type=messages') as any;
    const response = await GET(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('缺少 conversation_id');
  });
});

describe('POST /api/supabase', () => {
  it('缺 type 时返回 400', async () => {
    const { POST } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase', {
      method: 'POST',
      body: JSON.stringify({ user_id: 'u1' }),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('无效的类型');
  });

  it('创建 conversation 成功', async () => {
    const { POST } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase', {
      method: 'POST',
      body: JSON.stringify({ type: 'conversation', user_id: 'u1', title: '对话' }),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});

describe('DELETE /api/supabase', () => {
  it('缺 id 时返回 400', async () => {
    const { DELETE } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase?type=homework') as any;
    const response = await DELETE(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('缺少 id 或 type');
  });

  it('缺 type 时返回 400', async () => {
    const { DELETE } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase?id=1') as any;
    const response = await DELETE(req);
    expect(response.status).toBe(400);
  });

  it('有 id 和 type 时删除成功', async () => {
    const { DELETE } = await import('@/api/supabase/route');
    const req = new Request('http://localhost/api/supabase?type=homework&id=1') as any;
    const response = await DELETE(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
