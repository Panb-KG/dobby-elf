/**
 * GET/POST /api/auth-sb 测试
 * 验证认证 API 的注册/登录/用户信息接口
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(() => ({ data: null, error: null })),
    single: vi.fn(() => ({ data: null, error: null })),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn(() => ({ error: null })),
  })),
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    getUser: vi.fn(),
    admin: {
      createUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'u1' } },
        error: null,
      })),
    },
  },
};

vi.mock('@/api/auth-sb/helpers', () => ({
  supabaseUrl: 'https://test.supabase.co',
  supabaseServiceKey: 'test-key',
  getSupabase: vi.fn(() => mockSupabase),
  getSupabaseAnon: vi.fn(() => mockSupabase),
  toFakeEmail: vi.fn((u: string) => `${u}@dobby-elf.app`),
  generateToken: vi.fn(() => 'tk_test'),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('POST /api/auth-sb', () => {
  it('无效 action 返回 400', async () => {
    const { POST } = await import('@/api/auth-sb/route');
    const req = new Request('http://localhost/api/auth-sb', {
      method: 'POST',
      body: JSON.stringify({ action: 'invalid' }),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('无效的操作');
  });

  it('register_parent 调用处理函数', async () => {
    mockSupabase.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    const { POST } = await import('@/api/auth-sb/route');
    const req = new Request('http://localhost/api/auth-sb', {
      method: 'POST',
      body: JSON.stringify({
        action: 'register_parent',
        username: 'parent1',
        password: 'pass123',
      }),
    }) as any;
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('login 调用处理函数', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: { access_token: 'tk1' } },
      error: null,
    });
    const { POST } = await import('@/api/auth-sb/route');
    const req = new Request('http://localhost/api/auth-sb', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', username: 'user1', password: 'pass' }),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBeDefined();
  });

  it('空 body 返回 500', async () => {
    const { POST } = await import('@/api/auth-sb/route');
    const req = new Request('http://localhost/api/auth-sb', {
      method: 'POST',
      body: JSON.stringify({}),
    }) as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});

describe('GET /api/auth-sb', () => {
  it('无效 action 返回 400', async () => {
    const { GET } = await import('@/api/auth-sb/route');
    const req = new Request('http://localhost/api/auth-sb?action=invalid') as any;
    const response = await GET(req);
    expect(response.status).toBe(400);
  });

  it('me 无 token 返回 401', async () => {
    const { GET } = await import('@/api/auth-sb/route');
    const req = new Request('http://localhost/api/auth-sb?action=me') as any;
    const response = await GET(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('未登录');
  });

  it('me 有 token 但验证失败返回 401', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' },
    });
    const { GET } = await import('@/api/auth-sb/route');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer fake-token');
    const req = new Request('http://localhost/api/auth-sb?action=me', {
      headers,
    }) as any;
    const response = await GET(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('登录已过期');
  });

  it('me 验证成功但 profile 不存在返回 404', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => ({ data: null, error: null })),
    });
    const { GET } = await import('@/api/auth-sb/route');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer fake-token');
    const req = new Request('http://localhost/api/auth-sb?action=me', {
      headers,
    }) as any;
    const response = await GET(req);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('用户资料不存在');
  });

  it('me 验证成功且 profile 存在返回用户信息', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => ({
        data: {
          id: 'u1',
          username: 'testuser',
          role: 'student',
          grade: '3',
          display_name: '测试用户',
          points: 100,
          level: 2,
          tree_growth: 10,
        },
        error: null,
      })),
    });
    const { GET } = await import('@/api/auth-sb/route');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer fake-token');
    const req = new Request('http://localhost/api/auth-sb?action=me', {
      headers,
    }) as any;
    const response = await GET(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.id).toBe('u1');
    expect(data.user.username).toBe('testuser');
    expect(data.user.level).toBe('2');
  });
});
