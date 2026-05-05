/**
 * 测试环境配置
 * 
 * 设置全局测试工具和环境变量
 */

import { vi, afterEach } from 'vitest';

// 模拟 localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
  get length() {
    return Object.keys(this.store).length;
  },
  key(index: number) {
    return Object.keys(this.store)[index] || null;
  },
};

// Make Object.keys work on the mock
Object.defineProperty(localStorageMock, Symbol.toStringTag, {
  value: 'Storage',
});

// Proxy to make Object.keys work
const proxiedLocalStorage = new Proxy(localStorageMock, {
  ownKeys(target) {
    return Reflect.ownKeys(target.store);
  },
  getOwnPropertyDescriptor(target, prop) {
    if (prop in target.store) {
      return { enumerable: true, configurable: true, value: target.store[prop as string] };
    }
    return undefined;
  },
});

Object.defineProperty(window, 'localStorage', {
  value: proxiedLocalStorage,
});

// 模拟 navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// 清理所有模拟
afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
