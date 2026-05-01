"use client";

import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

interface Stats {
  api: {
    today: Array<{ endpoint: string; count: number }>;
    weekTotal: number;
  };
  errors: {
    today: number;
    week: number;
    recent: Array<{ message: string; category: string; created_at: string }>;
  };
  users: {
    total: number;
    activeThisWeek: number;
  };
  content: {
    courses: number;
    homeworkPending: number;
    homeworkCompleted: number;
    exerciseSessions: number;
    avgScore: number;
    poetryQuestions: number;
  };
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30秒自动刷新
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/system/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🧹</div>
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 mt-1">系统运行概览 · 每30秒自动刷新</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总用户数"
            value={stats?.users.total || 0}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="本周活跃"
            value={stats?.users.activeThisWeek || 0}
            icon="🔥"
            color="green"
          />
          <StatCard
            title="API 调用 (今日)"
            value={stats?.api.today.reduce((a, b) => a + b.count, 0) || 0}
            icon="📡"
            color="purple"
          />
          <StatCard
            title="错误数 (今日)"
            value={stats?.errors.today || 0}
            icon="⚠️"
            color={stats && stats.errors.today > 0 ? "red" : "gray"}
          />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="课程数"
            value={stats?.content.courses || 0}
            icon="📚"
            color="indigo"
          />
          <StatCard
            title="待完成作业"
            value={stats?.content.homeworkPending || 0}
            icon="📝"
            color="orange"
          />
          <StatCard
            title="练习会话"
            value={stats?.content.exerciseSessions || 0}
            icon="🎯"
            color="teal"
          />
          <StatCard
            title="平均正确率"
            value={`${stats?.content.avgScore || 0}%`}
            icon="📊"
            color="emerald"
          />
        </div>

        {/* API Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API 调用统计 (今日)</h2>
          {stats?.api.today && stats.api.today.length > 0 ? (
            <div className="space-y-3">
              {stats.api.today.map((item) => (
                <div key={item.endpoint} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-mono">{item.endpoint}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((item.count / (stats?.api.weekTotal || 1)) * 100 * 7, 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">暂无数据</p>
          )}
        </div>

        {/* Recent Errors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近错误</h2>
          {stats?.errors.recent && stats.errors.recent.length > 0 ? (
            <div className="space-y-2">
              {stats.errors.recent.slice(0, 10).map((err, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg">
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
    </AdminLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    orange: 'bg-orange-50 border-orange-200',
    teal: 'bg-teal-50 border-teal-200',
    emerald: 'bg-emerald-50 border-emerald-200',
  };

  const textColorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    indigo: 'text-indigo-600',
    orange: 'text-orange-600',
    teal: 'text-teal-600',
    emerald: 'text-emerald-600',
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${textColorMap[color] || textColorMap.gray}`}>
            {value}
          </p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
