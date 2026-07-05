"use client";

/**
 * SyncIndicator - 离线同步状态指示器
 * 显示在线/离线状态及待同步队列数量
 */

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { offlineSync } from '../../lib/offline-sync';

export function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const onOnline = () => { setIsOnline(true); setPendingCount(offlineSync.getQueueStatus().pending); };
    const onOffline = () => { setIsOnline(false); setShowBanner(true); };
    const onQueueChange = () => setPendingCount(offlineSync.getQueueStatus().pending);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const cleanup = offlineSync.onChange(onQueueChange);

    setPendingCount(offlineSync.getQueueStatus().pending);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      cleanup();
    };
  }, []);

  if (!showBanner && isOnline && pendingCount === 0) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/90 text-white text-sm shadow-lg backdrop-blur-sm">
          <WifiOff className="w-4 h-4" />
          <span>已离线 — 数据将自动保存，联网后同步</span>
        </div>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/90 text-white text-sm shadow-lg backdrop-blur-sm">
          <Cloud className="w-4 h-4 animate-pulse" />
          <span>正在同步 {pendingCount} 项数据...</span>
        </div>
      </div>
    );
  }

  // 刚从离线恢复
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm shadow-lg backdrop-blur-sm cursor-pointer",
          "bg-green-500/90 hover:bg-green-600/90 transition-colors"
        )}
        onClick={() => setShowBanner(false)}
      >
        <Wifi className="w-4 h-4" />
        <span>已恢复在线</span>
      </div>
    </div>
  );
}
