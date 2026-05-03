/**
 * 统一控制台日志工具
 * 
 * 根据 NODE_ENV 控制日志输出：
 * - development: 输出所有日志
 * - production: 仅输出 warn/error
 * 
 * 用法：替换所有 console.log/error/warn 为 log/error/warn
 */

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;

/** 调试信息（仅开发环境） */
export const debug = isDev
  ? (...args: unknown[]) => console.debug('[Dobi]', ...args)
  : () => {};

/** 一般信息（仅开发环境） */
export const info = isDev
  ? (...args: unknown[]) => console.info('[Dobi]', ...args)
  : () => {};

/** 警告（所有环境） */
export const warn = (...args: unknown[]) => console.warn('[Dobi]', ...args);

/** 错误（所有环境） */
export const error = (...args: unknown[]) => console.error('[Dobi]', ...args);

/** 日志（仅开发环境，兼容旧 console.log） */
export const log = isDev
  ? (...args: unknown[]) => console.log('[Dobi]', ...args)
  : () => {};
