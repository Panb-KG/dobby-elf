/**
 * GET/POST/PUT/DELETE /api/diary/entries 测试
 * 验证日记 API 的鉴权和 CRUD 逻辑
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: '未授权，请先登录' }), { status: 401 })
  ),
}));

vi.mock('@/lib/db-migration-v2', () => ({
  ensureV2Schema: vi.fn(),
}));

vi.mock('@/lib/diary', () => ({
  getDiaryEntries: vi.fn(),
  createDiaryEntry: vi.fn(),
  updateDiaryEntry: vi.fn(),
  deleteDiaryEntry: vi.fn(),
}));

vi.mock('@/lib/growth', () => ({
  addGrowthPoints: vi.fn(),
}));

import * as apiAuth from '@/lib/api-auth';
import * as diaryLib from '@/lib/diary';

const mockUser = { id: 'u1', email: 'test@dobby.app' };

function mockReq(url: string, method = 'GET', body?: object) {
  const headers = new Headers();
  if (body) headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Bearer fake-token');
  return new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }) as any;
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.mocked(apiAuth.requireAuth).mockResolvedValue(mockUser);
});

describe('GET /api/diary/entries', () => {
  it('未登录返回 401', async () => {
    vi.mocked(apiAuth.requireAuth).mockResolvedValue(null);
    const { GET } = await import('@/api/diary/entries/route');
    const response = await GET(mockReq('http://localhost/api/diary/entries'));
    expect(response.status).toBe(401);
  });

  it('已登录返回日记列表', async () => {
    vi.mocked(diaryLib.getDiaryEntries).mockResolvedValue([{ id: '1', content: '日记内容' }]);
    const { GET } = await import('@/api/diary/entries/route');
    const response = await GET(mockReq('http://localhost/api/diary/entries?date=2025-01-01'));
    const data = await response.json();
    expect(data.entries).toEqual([{ id: '1', content: '日记内容' }]);
    expect(data.total).toBe(1);
  });

  it('查询出错返回空数组', async () => {
    vi.mocked(diaryLib.getDiaryEntries).mockRejectedValue(new Error('DB error'));
    const { GET } = await import('@/api/diary/entries/route');
    const response = await GET(mockReq('http://localhost/api/diary/entries'));
    const data = await response.json();
    expect(data.entries).toEqual([]);
    expect(data.total).toBe(0);
  });
});

describe('POST /api/diary/entries', () => {
  it('未登录返回 401', async () => {
    vi.mocked(apiAuth.requireAuth).mockResolvedValue(null);
    const { POST } = await import('@/api/diary/entries/route');
    const response = await POST(mockReq('http://localhost/api/diary/entries', 'POST', {}));
    expect(response.status).toBe(401);
  });

  it('缺 date 和 content 返回 400', async () => {
    const { POST } = await import('@/api/diary/entries/route');
    const response = await POST(mockReq('http://localhost/api/diary/entries', 'POST', {}));
    expect(response.status).toBe(400);
  });

  it('参数齐全时创建成功', async () => {
    vi.mocked(diaryLib.createDiaryEntry).mockResolvedValue({ id: '1', content: '新日记' });
    const { POST } = await import('@/api/diary/entries/route');
    const response = await POST(
      mockReq('http://localhost/api/diary/entries', 'POST', {
        date: '2025-01-01',
        title: '我的日记',
        content: '新日记内容',
      })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.entry).toEqual({ id: '1', content: '新日记' });
  });
});

describe('PUT /api/diary/entries', () => {
  it('缺 id 返回 400', async () => {
    const { PUT } = await import('@/api/diary/entries/route');
    const response = await PUT(
      mockReq('http://localhost/api/diary/entries', 'PUT', { title: '更新' })
    );
    expect(response.status).toBe(400);
  });

  it('更新成功', async () => {
    vi.mocked(diaryLib.updateDiaryEntry).mockResolvedValue({ id: '1' });
    const { PUT } = await import('@/api/diary/entries/route');
    const response = await PUT(
      mockReq('http://localhost/api/diary/entries?id=1', 'PUT', {
        title: '更新标题',
        content: '更新内容',
      })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('日记不存在返回 404', async () => {
    vi.mocked(diaryLib.updateDiaryEntry).mockResolvedValue(null);
    const { PUT } = await import('@/api/diary/entries/route');
    const response = await PUT(
      mockReq('http://localhost/api/diary/entries?id=999', 'PUT', { content: 'no' })
    );
    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/diary/entries', () => {
  it('缺 id 返回 400', async () => {
    const { DELETE } = await import('@/api/diary/entries/route');
    const response = await DELETE(mockReq('http://localhost/api/diary/entries'));
    expect(response.status).toBe(400);
  });

  it('删除成功', async () => {
    vi.mocked(diaryLib.deleteDiaryEntry).mockResolvedValue(true);
    const { DELETE } = await import('@/api/diary/entries/route');
    const response = await DELETE(mockReq('http://localhost/api/diary/entries?id=1'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
