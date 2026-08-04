/**
 * 记忆管理面板组件
 * 
 * 功能：
 * - 查看所有记忆（按分类分组）
 * - 搜索记忆
 * - 编辑记忆内容
 * - 停用/激活记忆
 * - 删除记忆
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import type { MemoryCategory } from '@/types';
import { MEMORY_CATEGORY_LABELS } from '@/types';
import { getMemories, updateMemory, deleteMemory } from '@/lib/agent/client';
import type { Memory } from '@/lib/agent/client';

interface MemoryManagerProps {
  onClose: () => void;
}

const CATEGORY_COLORS: Record<MemoryCategory, string> = {
  user_profile: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  learning_pref: 'bg-green-500/10 text-green-400 border-green-500/20',
  important_event: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  conversation_habit: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export function MemoryManager({ onClose }: MemoryManagerProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 加载记忆
  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMemories({ limit: 100 });
      setMemories(data.memories);
    } catch (err) {
      console.error('加载记忆失败:', err);
      setError('加载记忆失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  // 过滤记忆
  const filteredMemories = memories.filter(m => {
    const matchesSearch = !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 按分类分组
  const groupedMemories = filteredMemories.reduce((acc, memory) => {
    const cat = memory.category as MemoryCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(memory);
    return acc;
  }, {} as Record<MemoryCategory, Memory[]>);

  // 编辑记忆
  async function handleSaveEdit(id: string) {
    try {
      await updateMemory(id, { content: editContent });
      setEditingId(null);
      await loadMemories();
    } catch (err) {
      console.error('更新记忆失败:', err);
      setError('更新失败，请重试');
    }
  }

  // 切换激活状态
  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      await updateMemory(id, { is_active: !currentActive });
      await loadMemories();
    } catch (err) {
      console.error('更新记忆状态失败:', err);
      setError('操作失败，请重试');
    }
  }

  // 删除记忆
  async function handleDelete(id: string) {
    if (!confirm('确定要删除这条记忆吗？')) return;
    try {
      await deleteMemory(id);
      await loadMemories();
    } catch (err) {
      console.error('删除记忆失败:', err);
      setError('删除失败，请重试');
    }
  }

  // 格式化时间
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-orange-950/30 to-transparent">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-orange-900/20">
        <h2 className="text-lg font-bold text-orange-100">✨ 我的记忆</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-orange-800/30 rounded-lg transition-colors"
        >
          <X size={18} className="text-orange-300" />
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="搜索记忆..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-orange-900/20 border border-orange-700/30 rounded-lg text-sm text-orange-100 placeholder-orange-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
                : 'bg-orange-900/10 border-orange-700/20 text-orange-400 hover:border-orange-500/30'
            }`}
          >
            全部
          </button>
          {(Object.keys(MEMORY_CATEGORY_LABELS) as MemoryCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
                  : 'bg-orange-900/10 border-orange-700/20 text-orange-400 hover:border-orange-500/30'
              }`}
            >
              {MEMORY_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* 记忆列表 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-orange-400">
            <p className="text-sm">还没有记忆</p>
            <p className="text-xs mt-1 opacity-60">多和我聊天，我会记住重要的信息 ✨</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(Object.keys(groupedMemories) as MemoryCategory[]).map(category => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-orange-300 mb-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${CATEGORY_COLORS[category]}`}>
                    {MEMORY_CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-orange-500/60">({groupedMemories[category].length})</span>
                </h3>
                <div className="space-y-2">
                  {groupedMemories[category].map(memory => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      isEditing={editingId === memory.id}
                      editContent={editContent}
                      onEditStart={() => {
                        setEditingId(memory.id);
                        setEditContent(memory.content);
                      }}
                      onEditSave={() => handleSaveEdit(memory.id)}
                      onEditCancel={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      onToggleActive={() => handleToggleActive(memory.id, memory.is_active)}
                      onDelete={() => handleDelete(memory.id)}
                      formatDate={formatDate}
                      setEditContent={setEditContent}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 单条记忆卡片
interface MemoryCardProps {
  memory: Memory;
  isEditing: boolean;
  editContent: string;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
  setEditContent: (content: string) => void;
}

function MemoryCard({
  memory,
  isEditing,
  editContent,
  onEditStart,
  onEditSave,
  onEditCancel,
  onToggleActive,
  onDelete,
  formatDate,
  setEditContent,
}: MemoryCardProps) {
  if (isEditing) {
    return (
      <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full p-2 bg-orange-950/30 border border-orange-700/30 rounded text-sm text-orange-100 focus:outline-none focus:border-orange-500/50 resize-none"
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={onEditSave}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-xs transition-colors"
          >
            <Check size={12} /> 保存
          </button>
          <button
            onClick={onEditCancel}
            className="px-3 py-1.5 bg-orange-800/30 hover:bg-orange-800/50 text-orange-300 rounded text-xs transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        memory.is_active
          ? 'bg-orange-900/10 border-orange-700/20 hover:border-orange-500/30'
          : 'bg-gray-900/10 border-gray-700/20 opacity-60'
      }`}
    >
      <p className="text-sm text-orange-100 leading-relaxed">{memory.content}</p>
      
      {memory.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {memory.tags.map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-orange-800/20 text-orange-400 text-[10px] rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-700/10">
        <span className="text-[10px] text-orange-500">{formatDate(memory.created_at)}</span>
        
        <div className="flex gap-1">
          <button
            onClick={onToggleActive}
            className={`p-1.5 rounded transition-colors ${
              memory.is_active
                ? 'hover:bg-orange-800/30 text-orange-400'
                : 'hover:bg-green-800/30 text-green-400'
            }`}
            title={memory.is_active ? '停用' : '激活'}
          >
            {memory.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          
          <button
            onClick={onEditStart}
            className="p-1.5 hover:bg-blue-800/30 text-blue-400 rounded transition-colors"
            title="编辑"
          >
            <Edit2 size={14} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-800/30 text-red-400 rounded transition-colors"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// 小图标组件
function Eye({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
