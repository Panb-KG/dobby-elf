/**
 * supabase-diary.ts 单元测试
 * 
 * Mock Supabase 客户端，测试日记 CRUD 操作
 * 
 * 使用共享 result 对象 + thenable chain 模式：
 * - 所有链式方法返回同一个 chain 对象
 * - 测试通过修改 result 对象来控制返回值
 * - chain 是 thenable，await 时返回 result 对象
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared result object - tests mutate this, chain resolves to it
const result: { data: any; error: any } = { data: null, error: null };

// Create a thenable chain: all methods return `chain`, await resolves to `result`
function createChain() {
  const chain: any = {
    then(resolve: (v: any) => void) { resolve(result); },
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    or: vi.fn(),
    upsert: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
  // All intermediate methods return the chain
  ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit', 'or', 'upsert', 'single', 'maybeSingle'].forEach(m => {
    chain[m].mockReturnValue(chain);
  });
  return chain;
}

const chain = createChain();
const mockFrom = vi.fn().mockReturnValue(chain);

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');

import {
  saveDiaryRaw,
  getDiaryRawById,
  updateDiaryRaw,
  deleteDiaryRawById,
  getDiaryRaws,
  upsertDiaryProcessed,
  getDiaryProcessed,
  getDiaryProcessedList,
  deleteDiaryProcessed,
  searchDiaries,
} from './supabase-diary';

describe('supabase-diary', () => {
  beforeEach(() => {
    // Reset shared result
    result.data = null;
    result.error = null;
    // Clear call history (keep implementations)
    vi.clearAllMocks();
    mockFrom.mockReturnValue(chain);
  });

  // ===== saveDiaryRaw =====
  describe('saveDiaryRaw', () => {
    it('should insert raw diary and return data', async () => {
      const mockData = { id: 'r1', user_id: 'u1', input_type: 'text', raw_content: '今天很开心' };
      result.data = mockData;

      const r = await saveDiaryRaw('u1', 'text', '今天很开心');
      expect(mockFrom).toHaveBeenCalledWith('diary_raw');
      expect(chain.insert).toHaveBeenCalled();
      expect(r).toEqual(mockData);
    });

    it('should throw error on insert failure', async () => {
      result.error = { message: 'DB error' };
      await expect(saveDiaryRaw('u1', 'text', 'content')).rejects.toThrow('DB error');
    });

    it('should pass imageUrls and metadata options', async () => {
      result.data = { id: 'r2' };
      await saveDiaryRaw('u1', 'image', '', { imageUrls: ['img1'], metadata: { mood: 'happy' } });
      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
        image_urls: ['img1'],
        metadata: { mood: 'happy' },
      }));
    });
  });

  // ===== getDiaryRawById =====
  describe('getDiaryRawById', () => {
    it('should return raw diary by id', async () => {
      const mockData = { id: 'r1', user_id: 'u1', raw_content: 'test' };
      result.data = mockData;

      const r = await getDiaryRawById('r1', 'u1');
      expect(chain.eq).toHaveBeenCalledWith('id', 'r1');
      expect(r).toEqual(mockData);
    });

    it('should return null on error', async () => {
      result.error = { message: 'not found' };
      const r = await getDiaryRawById('r1', 'u1');
      expect(r).toBeNull();
    });
  });

  // ===== updateDiaryRaw =====
  describe('updateDiaryRaw', () => {
    it('should return true on success', async () => {
      result.error = null;
      const r = await updateDiaryRaw('r1', 'u1', { rawContent: 'updated' });
      expect(chain.update).toHaveBeenCalled();
      expect(r).toBe(true);
    });

    it('should return false on error', async () => {
      result.error = { message: 'fail' };
      const r = await updateDiaryRaw('r1', 'u1', {});
      expect(r).toBe(false);
    });
  });

  // ===== deleteDiaryRawById =====
  describe('deleteDiaryRawById', () => {
    it('should return true on success', async () => {
      result.error = null;
      const r = await deleteDiaryRawById('r1', 'u1');
      expect(chain.delete).toHaveBeenCalled();
      expect(r).toBe(true);
    });

    it('should return false on error', async () => {
      result.error = { message: 'fail' };
      const r = await deleteDiaryRawById('r1', 'u1');
      expect(r).toBe(false);
    });
  });

  // ===== getDiaryRaws =====
  describe('getDiaryRaws', () => {
    it('should return list of raw diaries', async () => {
      const mockData = [{ id: 'r1' }, { id: 'r2' }];
      result.data = mockData;

      const r = await getDiaryRaws('u1');
      expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(r).toEqual(mockData);
    });

    it('should return empty array on error', async () => {
      result.error = { message: 'fail' };
      const r = await getDiaryRaws('u1');
      expect(r).toEqual([]);
    });

    it('should respect custom limit', async () => {
      result.data = [];
      await getDiaryRaws('u1', 10);
      expect(chain.limit).toHaveBeenCalledWith(10);
    });
  });

  // ===== upsertDiaryProcessed =====
  describe('upsertDiaryProcessed', () => {
    it('should upsert processed diary', async () => {
      const mockData = { id: 'p1', user_id: 'u1', diary_date: '2026-08-01', title: 'Test' };
      result.data = mockData;

      const r = await upsertDiaryProcessed('u1', '2026-08-01', { title: 'Test' });
      expect(chain.upsert).toHaveBeenCalled();
      expect(r).toEqual(mockData);
    });

    it('should throw on error', async () => {
      result.error = { message: 'conflict' };
      await expect(upsertDiaryProcessed('u1', '2026-08-01', {})).rejects.toThrow('conflict');
    });
  });

  // ===== getDiaryProcessed =====
  describe('getDiaryProcessed', () => {
    it('should return processed diary for date', async () => {
      const mockData = { id: 'p1', diary_date: '2026-08-01' };
      result.data = mockData;

      const r = await getDiaryProcessed('u1', '2026-08-01');
      expect(r).toEqual(mockData);
    });

    it('should return null on error', async () => {
      result.error = { message: 'err' };
      const r = await getDiaryProcessed('u1', '2026-08-01');
      expect(r).toBeNull();
    });
  });

  // ===== getDiaryProcessedList =====
  describe('getDiaryProcessedList', () => {
    it('should return list of processed diaries', async () => {
      const mockData = [{ id: 'p1' }, { id: 'p2' }];
      result.data = mockData;

      const r = await getDiaryProcessedList('u1');
      expect(chain.order).toHaveBeenCalledWith('diary_date', { ascending: false });
      expect(r).toEqual(mockData);
    });

    it('should return empty array on error', async () => {
      result.error = { message: 'fail' };
      const r = await getDiaryProcessedList('u1');
      expect(r).toEqual([]);
    });
  });

  // ===== deleteDiaryProcessed =====
  describe('deleteDiaryProcessed', () => {
    it('should return true on success', async () => {
      result.error = null;
      const r = await deleteDiaryProcessed('u1', '2026-08-01');
      expect(chain.delete).toHaveBeenCalled();
      expect(r).toBe(true);
    });

    it('should return false on error', async () => {
      result.error = { message: 'fail' };
      const r = await deleteDiaryProcessed('u1', '2026-08-01');
      expect(r).toBe(false);
    });
  });

  // ===== searchDiaries =====
  describe('searchDiaries', () => {
    it('should search diaries by query', async () => {
      const mockData = [{ id: 'p1', title: '开心的一天' }];
      result.data = mockData;

      const r = await searchDiaries('u1', '开心');
      expect(chain.or).toHaveBeenCalledWith('title.ilike.%开心%,content.ilike.%开心%');
      expect(r).toEqual(mockData);
    });

    it('should return empty array on error', async () => {
      result.error = { message: 'fail' };
      const r = await searchDiaries('u1', 'test');
      expect(r).toEqual([]);
    });
  });
});
