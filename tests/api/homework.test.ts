/**
 * GET/POST/DELETE/PATCH /api/homework 测试
 * 验证作业 API 的参数校验和错误处理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn(() => ({ data: { id: '1' }, error: null })),
  })),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('GET /api/homework', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('缺 user_id 时返回空数组', async () => {
    const { GET } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework') as any;
    const response = await GET(req);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });

  it('有 user_id 时返回作业列表', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn(() => ({ data: [{ id: '1', title: '数学作业' }], error: null })),
    });
    const { GET } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework?user_id=u1') as any;
    const response = await GET(req);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: '1', title: '数学作业' }]);
  });
});

describe('POST /api/homework', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('缺 user_id 时返回 400', async () => {
    const { POST } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework', {
      method: 'POST',
      body: JSON.stringify({ title: '作业' }),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('缺少必要参数');
  });

  it('缺 title 时返回 400', async () => {
    const { POST } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework', {
      method: 'POST',
      body: JSON.stringify({ user_id: 'u1' }),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('参数齐全时创建成功', async () => {
    const { POST } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework', {
      method: 'POST',
      body: JSON.stringify({ user_id: 'u1', title: '数学作业', subject: '数学' }),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});

describe('DELETE /api/homework', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('缺 id 时返回 400', async () => {
    const { DELETE } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework') as any;
    const response = await DELETE(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('缺少 id');
  });

  it('有 id 时删除成功', async () => {
    const { DELETE } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework?id=1') as any;
    const response = await DELETE(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

describe('PATCH /api/homework', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('缺 id 时返回 400', async () => {
    const { PATCH } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'done' }),
    }) as any;
    const response = await PATCH(req);
    expect(response.status).toBe(400);
  });

  it('参数齐全时更新成功', async () => {
    const { PATCH } = await import('@/api/homework/route');
    const req = new Request('http://localhost/api/homework', {
      method: 'PATCH',
      body: JSON.stringify({ id: '1', status: 'done' }),
    }) as any;
    const response = await PATCH(req);
    expect(response.status).toBe(200);
  });
});
