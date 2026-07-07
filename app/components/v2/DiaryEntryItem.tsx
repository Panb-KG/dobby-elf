/**
 * 魔法日记 - 单条日记展示/编辑组件
 * 支持图片显示/编辑 + 语音录制/播放
 */

"use client";

import { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import type { DiaryEntry } from '@/lib/diary';
import { DiaryEntryEditor } from './DiaryEntryEditor';

interface DiaryEntryItemProps {
  entry: DiaryEntry;
  onUpdate: (id: string, data: {
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    images?: string[];
    audioUrl?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DiaryEntryItem({ entry, onUpdate, onDelete }: DiaryEntryItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (data: {
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    images?: string[];
    audioUrl?: string;
  }) => {
    await onUpdate(entry.id, data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // 编辑模式
  if (isEditing) {
    return (
      <DiaryEntryEditor
        entry={entry}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // 查看模式
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.mood && <span className="text-lg">{entry.mood}</span>}
          {entry.weather && <span className="text-lg">{entry.weather}</span>}
          <h4 className="text-sm font-medium text-orange-300">{entry.title}</h4>
          {entry.isVoice && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">🎤 语音</span>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-white/10 transition-colors">
            <Edit3 size={14} className="text-gray-400" />
          </button>
          <button onClick={() => onDelete(entry.id)} className="p-1 rounded hover:bg-red-500/20 transition-colors">
            <Trash2 size={14} className="text-gray-500 hover:text-red-400" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

      {/* 图片显示 */}
      {entry.images && entry.images.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {entry.images.map((url, idx) => (
            <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-white/10">
              <img src={url} alt={`日记图片 ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* 语音播放 */}
      {entry.audioUrl && (
        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <audio controls src={entry.audioUrl} className="flex-1 h-8" />
        </div>
      )}

      {entry.voiceDuration && !entry.audioUrl && (
        <div className="mt-2 text-xs text-gray-500">🎤 语音时长 {entry.voiceDuration} 秒</div>
      )}
    </div>
  );
}
