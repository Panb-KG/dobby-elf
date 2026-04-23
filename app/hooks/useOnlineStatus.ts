"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * useOnlineStatus Hook
 * 
 * 监听网络状态，提供离线提示能力
 * 
 * @example
 * ```tsx
 * const { isOnline, isOffline, wasOffline, clearOfflineState } = useOnlineStatus();
 * 
 * if (isOffline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [offlineTimestamp, setOfflineTimestamp] = useState<number | null>(null);

  useEffect(() => {
    // 初始化
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      if (!isOnline) {
        setWasOffline(true);
        setOfflineTimestamp(Date.now());
      }
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  /**
   * 清除离线状态标记
   */
  const clearOfflineState = useCallback(() => {
    setWasOffline(false);
    setOfflineTimestamp(null);
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    offlineTimestamp,
    clearOfflineState,
  };
}

export default useOnlineStatus;
