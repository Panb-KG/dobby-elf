/**
 * GET /api/health 测试
 * 验证健康检查接口的各种响应场景
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('正常情况: 返回 status: ok', async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    };
    vi.doMock('@/lib/supabase', () => ({
      getSupabaseBrowserClient: vi.fn(() => mockClient),
    }));

    const { GET } = await import('@/api/health/route');
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.services.supabase).toBe('connected');
  });

  it('Supabase 未配置: 返回 degraded', async () => {
    vi.doMock('@/lib/supabase', () => ({
      getSupabaseBrowserClient: vi.fn(() => null),
    }));

    const { GET } = await import('@/api/health/route');
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe('degraded');
    expect(data.message).toBe('Supabase 未配置');
  });

  it('Supabase 连接失败: 返回 503', async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ error: { message: '连接失败' } })),
        })),
      })),
    };
    vi.doMock('@/lib/supabase', () => ({
      getSupabaseBrowserClient: vi.fn(() => mockClient),
    }));

    const { GET } = await import('@/api/health/route');
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.message).toBe('Supabase 连接失败');
  });
});
