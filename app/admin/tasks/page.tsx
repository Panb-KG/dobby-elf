"use client";

import { useState, useEffect } from 'react';
import { error } from '../../lib/console';
import AdminLayout from '../AdminLayout';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Task {
  id: string;
  name: string;
  description: string;
  cron: string;
  handler: string;
  status: string;
  last_run: string;
  last_status: string;
  run_count: number;
  error_count: number;
  last_error: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // 对话框状态
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({ isOpen: false, message: '', type: 'info' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tasks');
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
      }
    } catch (error) {
      error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          updates: { status: newStatus },
        }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      error('Failed to toggle task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;
    try {
      const res = await fetch(`/api/admin/tasks?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      error('Failed to delete task:', error);
    }
  };

  const handleRun = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tasks?id=${id}&action=run`, {
        method: 'POST',
      });
      if (res.ok) {
        setDialogConfig({ isOpen: true, message: '任务已触发执行', type: 'success' });
        fetchTasks();
      }
    } catch (error) {
      error('Failed to run task:', error);
      setDialogConfig({ isOpen: true, message: '运行任务失败', type: 'error' });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">任务调度</h1>
            <p className="text-gray-500 mt-1">管理系统定时任务</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
          >
            + 创建任务
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              暂无任务，点击"创建任务"添加
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span>📅 Cron: <code className="bg-gray-100 px-2 py-0.5 rounded">{task.cron}</code></span>
                      <span>🔧 处理器: <code className="bg-gray-100 px-2 py-0.5 rounded">{task.handler}</code></span>
                      <span>▶️ 执行 {task.run_count} 次</span>
                      {task.error_count > 0 && (
                        <span className="text-red-500">❌ 失败 {task.error_count} 次</span>
                      )}
                    </div>
                    {task.last_run && (
                      <p className="text-xs text-gray-400 mt-2">
                        上次执行: {task.last_run} {task.last_status && `(${task.last_status})`}
                      </p>
                    )}
                    {task.last_error && (
                      <p className="text-xs text-red-500 mt-1">
                        错误: {task.last_error}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleRun(task.id)}
                      className="px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      执行
                    </button>
                    <button
                      onClick={() => handleToggle(task)}
                      className="px-4 py-2 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {task.status === 'active' ? '暂停' : '启动'}
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* 对话框 */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        message={dialogConfig.message}
        type={dialogConfig.type}
        showCancel={false}
        onConfirm={() => setDialogConfig({ isOpen: false, message: '', type: 'info' })}
      />
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-700', label: '运行中' },
    paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '已暂停' },
    error: { bg: 'bg-red-100', text: 'text-red-700', label: '错误' },
  };

  const c = config[status] || config.paused;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
