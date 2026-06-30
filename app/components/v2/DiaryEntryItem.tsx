/**
 * 魔法日记 - 单条日记展示/编辑组件
 */

"use client";

import { useState } from 'react';
import { Edit3, Trash2, Save } from 'lucide-react';
import type { DiaryEntry } from '@/lib/diary';
import { MOOD_OPTIONS } from './diary-constants';

interface DiaryEntryItemProps {
  entry: DiaryEntry;
  onUpdate: (id: string, data: { title: string; content: string; mood?: string; weather?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DiaryEntryItem({ entry, onUpdate, onDelete }: DiaryEntryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editContent, setEditContent] = useState(entry.content);
  const [editMood, setEditMood] = useState(entry.mood || '');
  const [editWeather, setEditWeather] = useState(entry.weather || '');

  const handleSave = async () => {
    await onUpdate(entry.id, {
      title: editTitle || '无标题',
      content: editContent,
      mood: editMood || undefined,
      weather: editWeather || undefined,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/50" />
        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/50 resize-none" />
        <div className="flex gap-1 flex-wrap">
          {MOOD_OPTIONS.map(m => (
            <button key={m.emoji} onClick={() => setEditMood(editMood === m.emoji ? '' : m.emoji)}
              className={`px-2 py-0.5 rounded text-sm ${editMood === m.emoji ? 'bg-orange-500/30' : 'hover:bg-white/10'}`}>
              {m.emoji}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave}
            className="flex-1 py-1.5 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 text-orange-300 text-xs transition-colors">
            保存
          </button>
          <button onClick={() => setIsEditing(false)}
            className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 text-xs transition-colors">
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
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
      {entry.voiceDuration && (
        <div className="mt-2 text-xs text-gray-500">🎤 语音时长 {entry.voiceDuration} 秒</div>
      )}
    </div>
  );
}
