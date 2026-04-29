/**
 * storage.ts 工具函数测试
 */

import {
  getStorage,
  setStorage,
  removeStorage,
  clearStorage,
  hasStorage,
  getAllKeys,
  exportStorage,
  importStorage,
  getStorageUsage,
} from '../app/lib/storage';

describe('storage 工具函数', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setStorage', () => {
    it('应该存储值', () => {
      setStorage('test', 'value');
      expect(JSON.parse(localStorage.getItem('dobi_test') || '')?.value).toBe('value');
    });

    it('应该存储对象', () => {
      const obj = { name: 'test', count: 42 };
      setStorage('obj', obj);
      expect(JSON.parse(localStorage.getItem('dobi_obj') || '')?.value).toEqual(obj);
    });

    it('应该存储数组', () => {
      const arr = [1, 2, 3];
      setStorage('arr', arr);
      expect(JSON.parse(localStorage.getItem('dobi_arr') || '')?.value).toEqual(arr);
    });

    it('应该支持自定义前缀', () => {
      setStorage('test', 'value', { prefix: 'custom_' });
      expect(localStorage.getItem('custom_test')).not.toBeNull();
    });

    it('应该支持 TTL', () => {
      vi.useFakeTimers();
      
      setStorage('test', 'value', { ttl: 1000 });
      
      expect(getStorage('test')).toBe('value');
      
      vi.advanceTimersByTime(2000);
      
      expect(getStorage('test')).toBeNull();
      
      vi.useRealTimers();
    });

    it('应该处理存储满错误', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 模拟 QuotaExceededError
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      
      setStorage('test', 'value');
      
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });
  });

  describe('getStorage', () => {
    it('应该返回存储的值', () => {
      localStorage.setItem('dobi_test', JSON.stringify({ value: 'stored', timestamp: Date.now() }));
      expect(getStorage('test')).toBe('stored');
    });

    it('应该返回默认值当键不存在时', () => {
      expect(getStorage('nonexistent', 'default')).toBe('default');
    });

    it('应该返回 null 当没有默认值时', () => {
      expect(getStorage('nonexistent')).toBeNull();
    });

    it('应该处理过期值', () => {
      vi.useFakeTimers();
      
      localStorage.setItem('dobi_test', JSON.stringify({
        value: 'expired',
        timestamp: Date.now() - 2000,
        expiry: Date.now() - 1000,
      }));
      
      expect(getStorage('test')).toBeNull();
      
      vi.useRealTimers();
    });

    it('应该处理解析错误', () => {
      localStorage.setItem('dobi_test', 'invalid json');
      expect(getStorage('test', 'default')).toBe('default');
    });
  });

  describe('removeStorage', () => {
    it('应该移除存储项', () => {
      localStorage.setItem('dobi_test', 'value');
      removeStorage('test');
      expect(localStorage.getItem('dobi_test')).toBeNull();
    });

    it('应该支持自定义前缀', () => {
      localStorage.setItem('custom_test', 'value');
      removeStorage('test', { prefix: 'custom_' });
      expect(localStorage.getItem('custom_test')).toBeNull();
    });
  });

  describe('clearStorage', () => {
    it('应该清空所有带前缀的键', () => {
      localStorage.setItem('dobi_test1', 'value1');
      localStorage.setItem('dobi_test2', 'value2');
      localStorage.setItem('other_test', 'value3');
      
      clearStorage();
      
      expect(localStorage.getItem('dobi_test1')).toBeNull();
      expect(localStorage.getItem('dobi_test2')).toBeNull();
      expect(localStorage.getItem('other_test')).toBe('value3');
    });
  });

  describe('hasStorage', () => {
    it('应该检查键是否存在', () => {
      localStorage.setItem('dobi_test', 'value');
      expect(hasStorage('test')).toBe(true);
      expect(hasStorage('nonexistent')).toBe(false);
    });
  });

  describe('getAllKeys', () => {
    it('应该返回所有带前缀的键', () => {
      localStorage.setItem('dobi_test1', 'value1');
      localStorage.setItem('dobi_test2', 'value2');
      localStorage.setItem('other_test', 'value3');
      
      const keys = getAllKeys();
      expect(keys).toContain('dobi_test1');
      expect(keys).toContain('dobi_test2');
      expect(keys).not.toContain('other_test');
    });
  });

  describe('exportStorage', () => {
    it('应该导出所有数据为 JSON', () => {
      localStorage.setItem('dobi_test1', JSON.stringify({ value: 'value1', timestamp: Date.now() }));
      localStorage.setItem('dobi_test2', JSON.stringify({ value: 'value2', timestamp: Date.now() }));
      
      const exported = exportStorage();
      const data = JSON.parse(exported);
      
      expect(data.test1.value).toBe('value1');
      expect(data.test2.value).toBe('value2');
    });
  });

  describe('importStorage', () => {
    it('应该从 JSON 导入数据', () => {
      const jsonData = JSON.stringify({
        test1: { value: 'value1', timestamp: Date.now() },
        test2: { value: 'value2', timestamp: Date.now() },
      });
      
      importStorage(jsonData);
      
      expect(getStorage('test1')).toBe('value1');
      expect(getStorage('test2')).toBe('value2');
    });

    it('应该处理无效 JSON', () => {
      expect(() => importStorage('invalid json')).toThrow('导入数据失败，请检查文件格式');
    });
  });

  describe('getStorageUsage', () => {
    it('应该返回存储使用情况', () => {
      localStorage.setItem('dobi_test', 'value');
      
      const usage = getStorageUsage();
      
      expect(usage.used).toBeGreaterThan(0);
      expect(usage.total).toBeGreaterThan(0);
      expect(usage.percentage).toBeGreaterThanOrEqual(0);
      expect(usage.percentage).toBeLessThanOrEqual(100);
    });
  });
});
