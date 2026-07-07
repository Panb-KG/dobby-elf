/**
 * 魔法日记面板
 * 
 * 小朋友的文字/语音日记，按日期存储和编辑
 * v2.0 新增
 */

"use client";

import { useState, useEffect, memo } from 'react';
import {
  Plus, ChevronLeft, ChevronRight, Search,
  Sparkles, BookOpen,
} from 'lucide-react';
import type { DiaryEntry } from '@/lib/diary';
import {
  getDiaryEntries, createDiaryEntry, updateDiaryEntry,
  deleteDiaryEntry, getDiaryDates,
} from '@/lib/agent/client';
import { DiaryNewForm } from './DiaryNewForm';
import { DiaryEntryItem } from './DiaryEntryItem';
import { formatDate } from './diary-constants';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { authFetch } from '@/lib/api-client';

export default memo(function DiaryPanel() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [diaryDates, setDiaryDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiaryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 对话框状态
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'error' | 'success' | 'info';
  }>({ isOpen: false, message: '', type: 'info' });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesRes, datesRes] = await Promise.all([
        getDiaryEntries(selectedDate).catch(() => ({ entries: [] })),
        getDiaryDates(30).catch(() => ({ dates: [] })),
      ]);
      setEntries(Array.isArray(entriesRes?.entries) ? entriesRes.entries : []);
      setDiaryDates(Array.isArray(datesRes?.dates) ? datesRes.dates : []);
    } catch (e) {
      console.error('加载日记失败', e);
      setEntries([]);
      setDiaryDates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      const res = await authFetch(`/api/diary/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.entries || []);
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await createDiaryEntry(data);
      setShowNewForm(false);
      loadData();
    } catch (e: any) {
      setDialogConfig({ isOpen: true, message: e.message || '创建失败', type: 'error' });
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateDiaryEntry(id, data);
      loadData();
    } catch (e: any) {
      setDialogConfig({ isOpen: true, message: e.message || '保存失败', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇日记吗？')) return;
    try {
      await deleteDiaryEntry(id);
      loadData();
    } catch (e: any) {
      setDialogConfig({ isOpen: true, message: e.message || '删除失败', type: 'error' });
    }
  };

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const today = new Date().toISOString().split('T')[0];
  const hasEntryOnDate = Array.isArray(diaryDates) && diaryDates.some(d => d.date === selectedDate);

  if (loading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <BookOpen size={32} className="mb-3 opacity-50" />
        <p className="text-sm">日记加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="flex gap-2">
        <input type="text" value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="搜索日记..."
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />
        <button onClick={handleSearch}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <Search size={16} className="text-gray-400" />
        </button>
      </div>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map(entry => (
            <div key={entry.id}
              onClick={() => {
                setSelectedDate(entry.date);
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">{entry.date}</span>
                {entry.mood && <span>{entry.mood}</span>}
                <span className="text-sm font-medium text-orange-300">{entry.title}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 日期导航 */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigateDate(-1)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <ChevronLeft size={18} className="text-gray-400" />
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-orange-400">{formatDate(selectedDate)}</div>
          {selectedDate === today && <span className="text-xs text-green-400">今天</span>}
          {hasEntryOnDate && <div className="text-xs text-gray-500">{entries.length} 篇日记</div>}
        </div>
        <button onClick={() => navigateDate(1)} disabled={selectedDate >= today}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>

      {/* 快速跳转到有日记的日期 */}
      {diaryDates.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {diaryDates.slice(0, 10).map(d => (
            <button key={d.date} onClick={() => setSelectedDate(d.date)}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs transition-colors ${
                selectedDate === d.date ? 'bg-orange-500/30 text-orange-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>
              {d.date.slice(5)}
              {d.moods?.[0] && <span className="ml-1">{d.moods[0]}</span>}
            </button>
          ))}
        </div>
      )}

      {/* 新建按钮 / 表单 */}
      {!showNewForm ? (
        <button onClick={() => setShowNewForm(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-orange-500/30 hover:border-orange-500/60 text-orange-400 hover:text-orange-300 transition-all flex items-center justify-center gap-2 text-sm">
          <Plus size={16} />写一篇魔法日记 ✨
        </button>
      ) : (
        <DiaryNewForm 
          selectedDate={selectedDate} 
          userId="guest" // TODO: 从 page.tsx 传入真实 userId
          onCreate={handleCreate} 
          onCancel={() => setShowNewForm(false)} 
        />
      )}

      {/* 日记列表 */}
      {entries.length === 0 && !showNewForm && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">今天还没有写日记</p>
          <p className="text-xs mt-1">点击上面的按钮开始写一篇吧！</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
            <DiaryEntryItem entry={entry} onUpdate={handleUpdate} onDelete={handleDelete} />
          </div>
        ))}
      </div>
      
      {/* 错误提示对话框 */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        message={dialogConfig.message}
        type={dialogConfig.type}
        showCancel={false}
        onConfirm={() => setDialogConfig({ isOpen: false, message: '', type: 'info' })}
      />
    </div>
  );
});
