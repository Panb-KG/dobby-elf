"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';

interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  created_at: string;
  points: number;
  level: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, searchKeyword]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchKeyword) params.set('keyword', searchKeyword);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除失败');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-500 mt-1">管理系统用户，共 {total} 个用户</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索用户名、昵称、邮箱..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
          >
            搜索
          </button>
          {(keyword || searchKeyword) && (
            <button
              onClick={() => {
                setKeyword('');
                setSearchKeyword('');
                setPage(1);
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors"
            >
              清除
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">用户</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">邮箱</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">等级</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">积分</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">注册时间</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      加载中...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      暂无用户
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.display_name || user.username}</p>
                          <p className="text-sm text-gray-400">@{user.username}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          {user.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.points}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{user.created_at}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-sm text-red-500 hover:text-red-700 transition-colors"
                        >
                          删除
                        </button>
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
