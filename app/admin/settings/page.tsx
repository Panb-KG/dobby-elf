"use client";

import { useState, useEffect } from 'react';
import { error } from '../../lib/console';
import AdminLayout from '../AdminLayout';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
      }
    } catch (error) {
      error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '设置已保存' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '保存失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev: Record<string, any>) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-400">加载中...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-500 mt-1">配置系统全局参数</p>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              站点名称
            </label>
            <input
              type="text"
              value={settings.siteName || '魔法小课桌'}
              onChange={(e) => updateSetting('siteName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* AI Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI 模型
            </label>
            <input
              type="text"
              value={settings.aiModel || 'qwen3.6-plus'}
              onChange={(e) => updateSetting('aiModel', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-400 mt-1">使用的 AI 模型名称</p>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大输出 Token 数
            </label>
            <input
              type="number"
              value={settings.maxTokens || 2048}
              onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.temperature || 0.7}
              onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-400 mt-1">值越高回复越有创意，值越低回复越确定</p>
          </div>

          {/* Max Chat History */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大聊天历史条数
            </label>
            <input
              type="number"
              value={settings.maxChatHistory || 50}
              onChange={(e) => updateSetting('maxChatHistory', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Enable Image Generation */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">启用图片生成</p>
              <p className="text-xs text-gray-400">允许 AI 生成图片辅助学习</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableImageGeneration !== false}
                onChange={(e) => updateSetting('enableImageGeneration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Enable Exercises */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">启用练习功能</p>
              <p className="text-xs text-gray-400">允许 AI 生成练习题</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableExercises !== false}
                onChange={(e) => updateSetting('enableExercises', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
            >
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
