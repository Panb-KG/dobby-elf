import { log } from './console';
/**
 * 性能优化工具
 * 
 * 功能：
 * - 防抖/节流
 * - 性能监控
 */

/**
 * 防抖函数
 * 
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 节流函数
 * 
 * @param fn 要节流的函数
 * @param interval 间隔时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * 性能监控
 * 
 * @param label 监控标签
 * @param fn 要监控的函数
 * @returns 函数执行结果
 */
export function measurePerformance<T>(label: string, fn: () => T): T {
  if (typeof performance === 'undefined') {
    return fn();
  }
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

/**
 * 异步性能监控
 * 
 * @param label 监控标签
 * @param fn 要监控的异步函数
 * @returns Promise<T>
 */
export async function measureAsyncPerformance<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (typeof performance === 'undefined') {
    return fn();
  }
  
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

export default {
  debounce,
  throttle,
  measurePerformance,
  measureAsyncPerformance,
};
