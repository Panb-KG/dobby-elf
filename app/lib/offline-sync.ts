/**
 * 离线同步管理器
 * 
 * 功能：
 * - 离线操作队列（网络恢复后自动同步）
 * - 网络状态监听
 * - 冲突检测与解决（同记录取最新 timestamp）
 */

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface QueueItem {
  operation: SyncOperation;
  resolve: () => void;
  reject: (err: Error) => void;
}

class OfflineSyncManager {
  private queue: QueueItem[] = [];
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<() => void> = new Set();
  private processing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  getOnline(): boolean {
    if (typeof navigator !== 'undefined') this.isOnline = navigator.onLine;
    return this.isOnline;
  }

  onChange(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  enqueue(op: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>): Promise<void> {
    return new Promise((resolve, reject) => {
      const syncOp: SyncOperation = {
        ...op,
        id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 5,
      };

      // 冲突解决：同 table+recordId 的操作，替换为最新的
      this.deduplicate(syncOp);
      this.queue.push({ operation: syncOp, resolve, reject });
      this.saveQueue();

      if (this.getOnline()) this.processQueue();
    });
  }

  /** 去重：对同一 table+data.id 的操作，保留 timestamp 最新的 */
  private deduplicate(op: SyncOperation): void {
    const recordId = op.data.id as string | undefined;
    if (!recordId) return;
    this.queue = this.queue.filter(item => {
      const existing = item.operation;
      if (existing.table === op.table && existing.data.id === recordId) {
        // 已有更旧的操作，丢弃旧的
        if (existing.timestamp < op.timestamp) {
          item.resolve();
          return false;
        }
        // 已有更新的操作，丢弃当前
        return true;
      }
      return true;
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0 || !this.getOnline()) return;
    this.processing = true;

    while (this.queue.length > 0 && this.getOnline()) {
      const item = this.queue[0];
      try {
        await this.executeOperation(item.operation);
        this.queue.shift();
        this.saveQueue();
        item.resolve();
      } catch (err) {
        item.operation.retryCount++;
        if (item.operation.retryCount >= item.operation.maxRetries) {
          this.queue.shift();
          this.saveQueue();
          item.reject(new Error('同步失败，已达最大重试次数'));
        } else {
          const delay = Math.min(1000 * Math.pow(2, item.operation.retryCount), 30000);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    this.processing = false;
  }

  /** 所有同步统一走 /api/supabase 路由 */
  private async executeOperation(op: SyncOperation): Promise<void> {
    const url = '/api/supabase';
    const userId = op.data.user_id || op.data.userId;

    if (op.type === 'create' || op.type === 'update') {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: op.table === 'courses' ? 'course' : op.table === 'homework' ? 'homework' : 'achievement',
          user_id: userId,
          ...op.data,
        }),
      });
      if (!res.ok) throw new Error(`Sync ${op.table} failed: ${res.status}`);
    } else {
      const typeParam = op.table === 'courses' ? 'course' : op.table === 'homework' ? 'homework' : 'achievement';
      const res = await fetch(`${url}?type=${typeParam}&id=${op.data.id}&user_id=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Delete ${op.table} failed: ${res.status}`);
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.notifyListeners();
    this.processQueue();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  private saveQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      const serializable = this.queue.map(item => ({ operation: item.operation }));
      localStorage.setItem('dobi_sync_queue', JSON.stringify(serializable));
    } catch (e) {
      console.error('[OfflineSync] Failed to save queue:', e);
    }
  }

  restoreQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('dobi_sync_queue');
      if (saved) {
        const items: { operation: SyncOperation }[] = JSON.parse(saved);
        this.queue = items.map(item => ({
          operation: item.operation,
          resolve: () => {},
          reject: () => {},
        }));
        // 冲突去重
        const seen = new Map<string, number>();
        this.queue = this.queue.filter(item => {
          const key = `${item.operation.table}:${item.operation.data.id}`;
          const prev = seen.get(key);
          if (prev !== undefined && item.operation.timestamp < prev) return false;
          seen.set(key, item.operation.timestamp);
          return true;
        });
        if (this.getOnline() && this.queue.length > 0) this.processQueue();
      }
    } catch (e) {
      console.error('[OfflineSync] Failed to restore queue:', e);
    }
  }

  getQueueStatus(): { pending: number; online: boolean } {
    return { pending: this.queue.length, online: this.getOnline() };
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineSync = new OfflineSyncManager();
export default offlineSync;
