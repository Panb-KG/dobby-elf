"use client";

import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

/**
 * 离线状态提示横幅
 * 
 * 显示在网络断开时，恢复后自动消失
 */
export function OfflineBanner() {
  const { isOnline, wasOffline, clearOfflineState } = useOnlineStatus();

  // 网络恢复后的提示
  if (wasOffline && isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center text-sm animate-slide-down">
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>网络已恢复，正在同步数据...</span>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <button
          onClick={clearOfflineState}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    );
  }

  // 离线提示
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm animate-slide-down">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>当前处于离线模式，数据将在联网后同步</span>
        </div>
      </div>
    );
  }

  return null;
}

export default OfflineBanner;
