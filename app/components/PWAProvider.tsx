"use client";

/**
 * PWA Provider
 * 
 * 注册 Service Worker 并提供离线状态
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, Cloud, CloudOff } from 'lucide-react';
import { registerSW } from '../lib/sw-register';
import { offlineSync } from '../lib/offline-sync';
import { log, error as logError } from '../lib/console';

interface PWAProviderProps {
  children: React.ReactNode;
}

/**
 * PWA Provider 组件
 * 
 * 功能：
 * 1. 注册 Service Worker
 * 2. 监听离线/在线状态
 * 3. 显示离线提示横幅
 * 4. 初始化离线同步队列
 */
export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  // 注册 Service Worker
  useEffect(() => {
    const register = async () => {
      try {
        const registration = await registerSW();
        if (registration) {
          setSwRegistered(true);
          log('[PWA] Service Worker 已注册');
        }
      } catch (err) {
        logError('[PWA] Service Worker 注册失败:', err);
      }
    };

    register();
  }, []);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      
      // 网络恢复，触发同步
      const status = offlineSync.getQueueStatus();
      if (status.pending > 0) {
        log(`[PWA] 网络恢复，${status.pending} 个待同步操作将自动执行`);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      
      // 3 秒后自动隐藏横幅（不阻塞操作）
      const timer = setTimeout(() => {
        setShowOfflineBanner(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始化同步状态
    const updateSyncStatus = () => {
      const status = offlineSync.getQueueStatus();
      setPendingSyncs(status.pending);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // 手动触发同步
  const triggerSync = useCallback(() => {
    if (isOnline) {
      offlineSync.restoreQueue();
      setShowOfflineBanner(false);
    }
  }, [isOnline]);

  return (
    <>
      {children}

      {/* 离线状态指示器 */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 
                       bg-amber-500/90 backdrop-blur-sm 
                       text-white px-4 py-2 rounded-full 
                       shadow-lg shadow-amber-500/20
                       flex items-center gap-2 text-sm font-medium"
          >
            <WifiOff className="w-4 h-4" />
            <span>离线模式 - 数据将本地保存</span>
            {pendingSyncs > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {pendingSyncs} 待同步
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 在线状态指示器（可选，显示在角落） */}
      {swRegistered && isOnline && pendingSyncs > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 z-40 
                     bg-blue-500/80 backdrop-blur-sm 
                     text-white px-3 py-1.5 rounded-full 
                     text-xs flex items-center gap-1.5"
        >
          <Cloud className="w-3 h-3 animate-pulse" />
          <span>{pendingSyncs} 同步中...</span>
        </motion.div>
      )}
    </>
  );
}

export default PWAProvider;
