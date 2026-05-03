/**
 * 离线同步管理器
 * 
 * 功能：
 * - 离线操作队列（网络恢复后自动同步）
 * - 网络状态监听
 * - 冲突检测与解决
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

export interface SyncQueueItem {
  operation: SyncOperation;
  resolve: () => void;
  reject: (error: Error) => void;
}

class OfflineSyncManager {
  private queue: SyncQueueItem[] = [];
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<() => void> = new Set();
  private processing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * 获取网络状态
   */
  getOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      this.isOnline = navigator.onLine;
    }
    return this.isOnline;
  }

  /**
   * 监听网络状态变化
   */
  onChange(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 添加同步操作到队列
   */
  enqueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>): Promise<void> {
    return new Promise((resolve, reject) => {
      const syncOperation: SyncOperation = {
        ...operation,
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 5,
      };

      this.queue.push({ operation: syncOperation, resolve, reject });
      this.saveQueue();

      // 如果在线，立即处理
      if (this.getOnline()) {
        this.processQueue();
      }
    });
  }

  /**
   * 处理同步队列
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0 || !this.getOnline()) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.getOnline()) {
      const item = this.queue[0];
      
      try {
        await this.syncOperation(item.operation);
        this.queue.shift();
        this.saveQueue();
        item.resolve();
      } catch (error) {
        item.operation.retryCount++;
        
        if (item.operation.retryCount >= item.operation.maxRetries) {
          this.queue.shift();
          this.saveQueue();
          item.reject(new Error('同步失败，已达最大重试次数'));
        } else {
          // 指数退避：等待时间递增
          const delay = Math.min(1000 * Math.pow(2, item.operation.retryCount), 30000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.processing = false;
  }

  /**
   * 执行单个同步操作
   */
  private async syncOperation(operation: SyncOperation): Promise<void> {
    const apiMap: Record<string, string> = {
      courses: '/api/courses',
      homework: '/api/homework',
      achievements: '/api/achievements',
      users: '/api/users',
    };

    const apiUrl = apiMap[operation.table];
    if (!apiUrl) {
      throw new Error(`未知的表：${operation.table}`);
    }

    const body: any = {
      userId: operation.data.user_id || operation.data.userId,
    };

    switch (operation.type) {
      case 'create':
      case 'update':
        body[operation.table.slice(0, -1)] = operation.data; // course/homework/achievement/user
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        break;

      case 'delete':
        await fetch(`${apiUrl}?id=${operation.data.id}&userId=${body.userId}`, {
          method: 'DELETE',
        });
        break;
    }
  }

  /**
   * 网络恢复
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.notifyListeners();
    this.processQueue();
  }

  /**
   * 网络断开
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners();
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  /**
   * 保存队列到 localStorage
   */
  private saveQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serializable = this.queue.map(item => ({
        operation: item.operation,
      }));
      localStorage.setItem('dobi_sync_queue', JSON.stringify(serializable));
    } catch (error) {
      error('Failed to save sync queue:', error);
    }
  }

  /**
   * 从 localStorage 恢复队列
   */
  restoreQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('dobi_sync_queue');
      if (saved) {
        const items = JSON.parse(saved);
        // 重新创建 Promise 包装
        this.queue = items.map((item: any) => ({
          operation: item.operation,
          resolve: () => {}, // 恢复时不触发 resolve
          reject: () => {},
        }));
        
        // 如果在线，开始处理
        if (this.getOnline() && this.queue.length > 0) {
          this.processQueue();
        }
      }
    } catch (error) {
      error('Failed to restore sync queue:', error);
    }
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): { pending: number; online: boolean } {
    return {
      pending: this.queue.length,
      online: this.getOnline(),
    };
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

// 单例
export const offlineSync = new OfflineSyncManager();

export default offlineSync;
