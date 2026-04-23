"use client";

import { useEffect, useRef, useCallback } from 'react';
import { offlineSync } from '../lib/offline-sync';

export interface UseSyncOptions {
  /** 用户 ID */
  userId: string;
  /** 是否启用同步（默认 true） */
  enabled?: boolean;
  /** 同步成功回调 */
  onSuccess?: (table: string) => void;
  /** 同步失败回调 */
  onError?: (table: string, error: Error) => void;
}

/**
 * useSync Hook
 * 
 * 桥接 localStorage 和后端 API，实现离线优先架构：
 * 1. 数据先写入 localStorage（即时响应）
 * 2. 后台同步到服务器（网络恢复后自动重试）
 * 
 * @example
 * ```tsx
 * const { sync, isSyncing, queueStatus } = useSync({ userId: 'user_123' });
 * 
 * // 保存课程
 * await sync('courses', {
 *   type: 'create',
 *   data: { id: 'course_1', day: '周一', subject: '数学', time: '08:00', type: '校内' },
 * });
 * ```
 */
export function useSync(options: UseSyncOptions) {
  const { userId, enabled = true, onSuccess, onError } = options;
  const isSyncing = useRef(false);

  // 初始化：恢复离线队列
  useEffect(() => {
    if (!enabled) return;
    offlineSync.restoreQueue();
  }, [enabled]);

  /**
   * 同步数据
   */
  const sync = useCallback(async (
    table: string,
    operation: { type: 'create' | 'update' | 'delete'; data: Record<string, any> }
  ) => {
    if (!enabled) return;

    const syncData = {
      ...operation.data,
      user_id: userId,
      userId,
    };

    // 1. 先写入本地存储（由 useLocalStorage 处理）
    
    // 2. 加入同步队列
    try {
      await offlineSync.enqueue({
        type: operation.type,
        table,
        data: syncData,
      });
      onSuccess?.(table);
    } catch (error) {
      console.error(`Sync failed for ${table}:`, error);
      onError?.(table, error as Error);
    }
  }, [userId, enabled, onSuccess, onError]);

  /**
   * 批量同步
   */
  const syncBatch = useCallback(async (
    table: string,
    operations: Array<{ type: 'create' | 'update' | 'delete'; data: Record<string, any> }>
  ) => {
    if (!enabled) return;

    for (const operation of operations) {
      await sync(table, operation);
    }
  }, [enabled, sync]);

  /**
   * 获取队列状态
   */
  const queueStatus = offlineSync.getQueueStatus();

  return {
    sync,
    syncBatch,
    isSyncing: isSyncing.current,
    queueStatus,
  };
}

export default useSync;
