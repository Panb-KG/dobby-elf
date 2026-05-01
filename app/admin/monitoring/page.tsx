"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';

interface MonitoringData {
  api: {
    totalCalls: number;
    avgDuration: number;
    maxDuration: number;
    errorCount: number;
    hourly: Array<{
      hour: string;
      calls: number;
      avgDuration: number;
      errors: number;
    }>;
  };
  errors: {
    byLevel: Array<{ level: string; count: number }>;
    recent: Array<{
      id: string;
      level: string;
      category: string;
      message: string;
      created_at: string;
    }>;
  };
  database: {
    size: number;
    sizeMB: number;
  };
  users: {
    activeUsers: number;
    totalMessages: number;
  };
  exercises: {
    totalSessions: number;
    avgScore: number;
    completedSessions: number;
  };
  timestamp: string;
}

export default function AdminMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('24h');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/monitoring?range=${range}`);
      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        setError(result.error || '获取数据失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">系统监控</h1>
            <p className="text-gray-500 mt-1">
              实时监控系统状态 · 每30秒自动刷新
            </p>
          </div>
          <div className="flex gap-2">
            {['1h', '6h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  range === r
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="API 总调用"
                value={data?.api.totalCalls || 0}
                subtitle={`平均 ${data?.api.avgDuration || 0}ms`}
                icon="📡"
                color="blue"
              />
              <StatCard
                title="最大延迟"
                value={`${data?.api.maxDuration || 0}ms`}
                subtitle="峰值响应时间"
                icon="⚡"
                color="orange"
              />
              <StatCard
                title="活跃用户"
                value={data?.users.activeUsers || 0}
                subtitle={`${data?.users.totalMessages || 0} 条消息`}
                icon="👥"
                color="green"
              />
              <StatCard
                title="数据库大小"
                value={`${data?.database.sizeMB || 0} MB`}
                subtitle="SQLite 文件"
                icon="💾"
                color="purple"
              />
            </div>

            {/* API Hourly Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">API 调用趋势</h2>
              {data?.api.hourly && data.api.hourly.length > 0 ? (
                <div className="space-y-2">
                  {data.api.hourly.slice(-24).map((item) => (
                    <div key={item.hour} className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-16 shrink-0">
                        {item.hour.slice(11, 16)}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min((item.calls / (data?.api.totalCalls || 1)) * 100 * 24, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-16 text-right">{item.calls}</span>
                      {item.errors > 0 && (
                        <span className="text-xs text-red-500 w-12 text-right">
                          {item.errors} 错误
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">暂无数据</p>
              )}
            </div>

            {/* Error Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">错误统计</h2>
                {data?.errors.byLevel && data.errors.byLevel.length > 0 ? (
                  <div className="space-y-3">
                    {data.errors.byLevel.map((item) => (
                      <div key={item.level} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{item.level}</span>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">✅ 暂无错误</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">最近错误</h2>
                {data?.errors.recent && data.errors.recent.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.errors.recent.slice(0, 10).map((err) => (
                      <div key={err.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
                            {err.category}
                          </span>
                          <span className="text-xs text-gray-400">{err.created_at}</span>
                        </div>
                        <p className="text-sm text-red-700">{err.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">✅ 暂无错误</p>
                )}
              </div>
            </div>

            {/* Exercise Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">练习统计</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">{data?.exercises.totalSessions || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">总练习次数</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-600">{data?.exercises.avgScore || 0}%</p>
                  <p className="text-sm text-gray-500 mt-1">平均正确率</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">{data?.exercises.completedSessions || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">已完成会话</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  const textColorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColorMap[color] || textColorMap.blue}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}
