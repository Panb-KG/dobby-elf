/**
 * 会话列表组件
 * 
 * Workbuddy 风格：左栏显示历史对话列表
 */

"use client";

import { memo, useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import {
  getConversations,
  createConversation,
  deleteConversation,
  type ConversationSummary,
} from '@/lib/agent/client';

interface ConversationListProps {
  currentConvId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: (id: string) => void;
}

export default memo(function ConversationList({
  currentConvId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations(50);
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('[ConversationList] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewChat = async () => {
    try {
      const data = await createConversation();
      onNewConversation(data.conversation.id);
      setConversations(prev => [data.conversation, ...prev]);
    } catch (err) {
      console.error('[ConversationList] New chat error:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('确定删除这个对话吗？')) return;

    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConvId === id) {
        // 如果删除的是当前对话，自动创建新对话
        handleNewChat();
      }
    } catch (err) {
      console.error('[ConversationList] Delete error:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 新建对话按钮 */}
      <button
        onClick={handleNewChat}
        className="flex items-center gap-2 mx-3 mt-3 mb-2 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
      >
        <Plus size={16} />
        新对话
      </button>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {loading ? (
          <div className="text-center py-4 text-gray-500 text-xs">加载中...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare size={24} className="mx-auto text-gray-600 mb-2" />
            <div className="text-xs text-gray-500">还没有对话记录</div>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                  currentConvId === conv.id
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <MessageSquare size={14} className="flex-shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{conv.title}</div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {conv.lastMessage || formatDate(conv.updated_at)}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                  title="删除"
                >
                  <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
