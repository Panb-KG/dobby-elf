"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Trash2, RefreshCw } from 'lucide-react';

/**
 * 调试页面 - 用于诊断登录状态和其他问题
 */
export default function DebugPage() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>({});
  const [sessionStorageData, setSessionStorageData] = useState<Record<string, any>>({});
  const [userAgent, setUserAgent] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString());

  useEffect(() => {
    // 读取 localStorage
    const localData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          localData[key] = JSON.parse(value || '');
        } catch {
          localData[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageData(localData);

    // 读取 sessionStorage
    const sessionData: Record<string, any> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const value = sessionStorage.getItem(key);
          sessionData[key] = JSON.parse(value || '');
        } catch {
          sessionData[key] = sessionStorage.getItem(key);
        }
      }
    }
    setSessionStorageData(sessionData);

    setUserAgent(navigator.userAgent);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const clearLocalStorage = () => {
    if (confirm('确定要清除所有 localStorage 数据吗？这将导致退出登录。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0a0502] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold text-white">
            🔍 调试信息
          </h1>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
            <button
              onClick={clearLocalStorage}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              清除缓存
            </button>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="p-6 rounded-xl bg-black/30 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold text-white"> 系统信息</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-white/50">时间戳：</span>
              <span className="text-white ml-2">{timestamp}</span>
            </div>
            <div>
              <span className="text-white/50">User Agent：</span>
              <pre className="text-white ml-2 mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                {userAgent}
              </pre>
            </div>
          </div>
        </div>

        {/* LocalStorage 数据 */}
        <div className="p-6 rounded-xl bg-black/30 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white"> LocalStorage 数据</h2>
            <button
              onClick={() => copyToClipboard(JSON.stringify(localStorageData, null, 2))}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-xs"
            >
              <Copy className="w-3 h-3" />
              复制
            </button>
          </div>
          
          {Object.keys(localStorageData).length === 0 ? (
            <p className="text-white/50 text-sm">无数据</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(localStorageData).map(([key, value]) => (
                <div key={key} className="p-3 rounded-lg bg-black/50 border border-white/5">
                  <div className="font-mono text-xs text-magic-accent mb-2">{key}</div>
                  <pre className="text-xs text-white/70 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {typeof value === 'object' 
                      ? JSON.stringify(value, null, 2) 
                      : String(value)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SessionStorage 数据 */}
        <div className="p-6 rounded-xl bg-black/30 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">️ SessionStorage 数据</h2>
            <button
              onClick={() => copyToClipboard(JSON.stringify(sessionStorageData, null, 2))}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-xs"
            >
              <Copy className="w-3 h-3" />
              复制
            </button>
          </div>
          
          {Object.keys(sessionStorageData).length === 0 ? (
            <p className="text-white/50 text-sm">无数据</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(sessionStorageData).map(([key, value]) => (
                <div key={key} className="p-3 rounded-lg bg-black/50 border border-white/5">
                  <div className="font-mono text-xs text-magic-accent mb-2">{key}</div>
                  <pre className="text-xs text-white/70 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {typeof value === 'object' 
                      ? JSON.stringify(value, null, 2) 
                      : String(value)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3">
          <h2 className="text-xl font-bold text-blue-400">ℹ️ 使用说明</h2>
          <ul className="text-sm text-blue-200 space-y-2 list-disc list-inside">
            <li><strong>登录状态持久化：</strong>检查 <code className="bg-blue-500/20 px-1 rounded">dobi_user_data</code> 和 <code className="bg-blue-500/20 px-1 rounded">dobi_auth_token</code> 是否存在</li>
            <li><strong>Token 过期：</strong>如果 token 已过期但仍保留本地数据，应用会进入离线模式继续使用</li>
            <li><strong>清除缓存：</strong>点击「清除缓存」按钮可以重置登录状态</li>
            <li><strong>查看错误：</strong>打开浏览器开发者工具（F12）→ Console 标签查看详细错误日志</li>
            <li><strong>复制信息：</strong>点击「复制」按钮可以将数据存储信息复制到剪贴板，方便反馈问题</li>
          </ul>
        </div>

        {/* 常见问题 */}
        <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-3">
          <h2 className="text-xl font-bold text-yellow-400">❓ 常见问题</h2>
          <div className="space-y-3 text-sm text-yellow-200">
            <div>
              <strong className="text-yellow-300">Q: 每次打开都要重新登录？</strong>
              <p className="mt-1 ml-4">A: 检查 localStorage 中是否有 dobi_user_data 和 dobi_auth_token。如果 token 过期但仍有本地数据，应用会进入离线模式。</p>
            </div>
            <div>
              <strong className="text-yellow-300">Q: 功能报错怎么办？</strong>
              <p className="mt-1 ml-4">A: 打开浏览器控制台（F12）查看详细错误信息，然后使用「复制」按钮将调试信息发送给我们。</p>
            </div>
            <div>
              <strong className="text-yellow-300">Q: 如何完全重置应用？</strong>
              <p className="mt-1 ml-4">A: 点击「清除缓存」按钮，然后刷新页面即可。</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
