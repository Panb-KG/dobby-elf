/**
 * 魔法日记 - 单条日记展示/编辑组件
 * 支持图片显示和编辑
 */

"use client";

import { useState, useRef } from 'react';
import { Edit3, Trash2, Image as ImageIcon, X } from 'lucide-react';
import type { DiaryEntry } from '@/lib/diary';
import { MOOD_OPTIONS } from './diary-constants';
import { authFetch } from '@/lib/api-client';

function validateImage(file: File, maxMB = 10): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) return { valid: false, error: '请选择图片文件' };
  if (file.size > maxMB * 1024 * 1024) return { valid: false, error: `图片不能超过 ${maxMB}MB` };
  return { valid: true };
}

interface DiaryEntryItemProps {
  entry: DiaryEntry;
  onUpdate: (id: string, data: { title: string; content: string; mood?: string; weather?: string; images?: string[] }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DiaryEntryItem({ entry, onUpdate, onDelete }: DiaryEntryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editContent, setEditContent] = useState(entry.content);
  const [editMood, setEditMood] = useState(entry.mood || '');
  const [editWeather, setEditWeather] = useState(entry.weather || '');
  const [editImages, setEditImages] = useState<string[]>(entry.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setUploading(true);
    try {
      let newUrls: string[] = [];
      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach(f => formData.append('images', f));
        const uploadRes = await authFetch('/api/diary/upload', {
          method: 'POST',
          body: formData,
          headers: {},
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || '图片上传失败');
        }
        const uploadData = await uploadRes.json();
        newUrls = uploadData.urls || [];
      }

      const allImages = [...editImages, ...newUrls];

      await onUpdate(entry.id, {
        title: editTitle || '无标题',
        content: editContent,
        mood: editMood || undefined,
        weather: editWeather || undefined,
        images: allImages.length > 0 ? allImages : undefined,
      });
      setIsEditing(false);
      setNewImageFiles([]);
    } catch (e: any) {
      alert(e.message || '保存失败');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(entry.title || '');
    setEditContent(entry.content);
    setEditMood(entry.mood || '');
    setEditWeather(entry.weather || '');
    setEditImages(entry.images || []);
    setNewImageFiles([]);
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const file of files) {
      const check = validateImage(file, 10);
      if (check.valid) valid.push(file);
    }
    setNewImageFiles(prev => [...prev, ...valid].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
          placeholder="日记标题"
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

        <div>
          <div className="text-xs text-gray-400 mb-1">📸 图片</div>
          {(editImages.length > 0 || newImageFiles.length > 0) && (
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {editImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden bg-white/10">
                  <img src={url} alt={`图片 ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-red-500/80 rounded-full hover:bg-red-600">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {newImageFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden bg-white/10 border border-orange-500/30">
                  <img src={URL.createObjectURL(file)} alt={`新图 ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => setNewImageFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-red-500/80 rounded-full hover:bg-red-600">
                    <X size={10} className="text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-orange-500/60 text-[9px] text-white text-center py-0.5">新增</div>
                </div>
              ))}
            </div>
          )}
          {editImages.length + newImageFiles.length < 5 && (
            <label className="w-full py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-gray-400 cursor-pointer">
              <ImageIcon size={12} />
              <span>添加图片</span>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSelectFiles} />
            </label>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={uploading}
            className="flex-1 py-1.5 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 disabled:opacity-30 text-orange-300 text-xs transition-colors">
            {uploading ? '上传中...' : '保存'}
          </button>
          <button onClick={handleCancel}
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

      {entry.images && entry.images.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {entry.images.map((url, idx) => (
            <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-white/10">
              <img src={url} alt={`日记图片 ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {entry.voiceDuration && (
        <div className="mt-2 text-xs text-gray-500">🎤 语音时长 {entry.voiceDuration} 秒</div>
      )}
    </div>
  );
}
