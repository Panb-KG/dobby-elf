"use client";

import { useState, useEffect } from 'react';
import { error } from '../../lib/console';
import AdminLayout from '../AdminLayout';

interface ApiRecord {
  id: string;
  endpoint: string;
  method: string;
  user_id: string;
  status_code: number;
  duration_ms: number;
  tokens_used: number;
  created_at: string;
}

export default function AdminApiRecordsPage() {
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [endpointFilter, setEndpointFilter] = useState('');
  const pageSize = 50;

  useEffect(() => {
    fetchRecords();
  }, [page, endpointFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (endpointFilter) params.set('endpoint', endpointFilter);

      const res = await fetch(`/api/admin/api-records?${params}`);
      const data = await res.json();
      if (res.ok) {
        setRecords(data.records);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      error('Failed to fetch API records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status < 300) return 'text-green-600 bg-green-50';
    if (status < 400) return 'text-blue-600 bg-blue-50';
    if (status < 500) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDurationColor = (ms: number) => {
    if (ms < 500) return 'text-green-600';
    if (ms < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API 调用记录</h1>
          <p className="text-gray-500 mt-1">共 {total} 条记录</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={endpointFilter}
            onChange={(e) => {
              setEndpointFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">全部接口</option>
            <option value="/api/chat">/api/chat</option>
            <option value="/api/auth/login">/api/auth/login</option>
            <option value="/api/auth/register">/api/auth/register</option>
            <option value="/api/courses">/api/courses</option>
            <option value="/api/homework">/api/homework</option>
            <option value="/api/exercises">/api/exercises</option>
            <option value="/api/image">/api/image</option>
          </select>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">时间</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">接口</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">耗时</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      加载中...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      暂无记录
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {record.created_at}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {record.method}
                          </span>
                          <span className="text-sm text-gray-700 ml-2 font-mono">
                            {record.endpoint}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(record.status_code)}`}>
                          {record.status_code}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${getDurationColor(record.duration_ms)}`}>
                        {record.duration_ms}ms
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {record.tokens_used || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                第 {page} 页，共 {Math.ceil(total / pageSize)} 页
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
