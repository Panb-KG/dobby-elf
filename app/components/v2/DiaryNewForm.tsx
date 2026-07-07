/**
 * 魔法日记 - 新建日记表单
 * 支持文字 + 图片 + 语音录制
 */

"use client";

import { useState, useCallback } from 'react';
import { Mic, Save, X, Trash2 } from 'lucide-react';
import { MOOD_OPTIONS, WEATHER_OPTIONS } from './diary-constants';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { DiaryImagePicker } from './DiaryImagePicker';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { authFetch } from '@/lib/api-client';

interface DiaryNewFormProps {
  selectedDate: string;
  userId: string;
  onCreate: (data: {
    date: string;
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    isVoice: boolean;
    voiceDuration?: number;
    audioUrl?: string;
    images?: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function DiaryNewForm({ selectedDate, userId, onCreate, onCancel }: DiaryNewFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // 语音录制状态
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // 对话框状态
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({ isOpen: false, message: '', type: 'info' });

  // 处理语音录制确认
  const handleVoiceConfirm = useCallback(async (audioBlob: Blob, durationSeconds: number) => {
    try {
      // 上传音频
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      const uploadRes = await authFetch('/api/diary/audio-upload', {
        method: 'POST',
        body: formData,
        headers: {}, // 不设 Content-Type，让浏览器自动设置
      });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.error || '音频上传失败');
      }
      const data = await uploadRes.json();
      setAudioUrl(data.url);
      setAudioDuration(durationSeconds);
      setShowVoiceRecorder(false);
      
      // 如果有音频，自动填入"语音日记"标题和内容提示
      if (!content.trim()) {
        setContent(`[语音日记] ${durationSeconds}秒录音`);
      }
      if (!title.trim()) {
        setTitle('语音日记');
      }
    } catch (err: any) {
      setDialogConfig({ isOpen: true, message: err.message || '音频上传失败', type: 'error' });
      setShowVoiceRecorder(false);
    }
  }, [content, title]);

  const handleCreate = async () => {
    if (!content.trim()) return;
    
    setUploading(true);
    try {
      // 上传图片
      let uploadedUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(file => formData.append('images', file));
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
        uploadedUrls = uploadData.urls || [];
      }
      
      await onCreate({
        date: selectedDate,
        title: title.trim() || '无标题',
        content: content.trim(),
        mood: mood || undefined,
        weather: weather || undefined,
        isVoice: !!audioUrl,
        voiceDuration: audioUrl ? audioDuration : undefined,
        audioUrl: audioUrl || undefined,
        images: uploadedUrls,
      });
      
      setTitle('');
      setContent('');
      setMood('');
      setWeather('');
      setImages([]);
      setAudioUrl('');
      setAudioDuration(0);
    } catch (error: any) {
      setDialogConfig({ 
        isOpen: true, 
        message: error.message || '上传失败', 
        type: 'error' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-orange-400">✍️ 新日记</span>
        <button onClick={onCancel} className="p-1 rounded hover:bg-white/10">
          <X size={14} className="text-gray-400" />
        </button>
      </div>

      {/* 心情选择 */}
      <div>
        <span className="text-xs text-gray-400">今天的心情</span>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {MOOD_OPTIONS.map(m => (
            <button key={m.emoji} onClick={() => setMood(mood === m.emoji ? '' : m.emoji)}
              className={`px-2 py-1 rounded-lg text-sm transition-all ${mood === m.emoji ? 'bg-orange-500/30 ring-1 ring-orange-500' : 'hover:bg-white/10'}`}
              title={m.label}>{m.emoji}</button>
          ))}
        </div>
      </div>

      {/* 天气选择 */}
      <div>
        <span className="text-xs text-gray-400">天气</span>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {WEATHER_OPTIONS.map(w => (
            <button key={w.emoji} onClick={() => setWeather(weather === w.emoji ? '' : w.emoji)}
              className={`px-2 py-1 rounded-lg text-sm transition-all ${weather === w.emoji ? 'bg-blue-500/30 ring-1 ring-blue-500' : 'hover:bg-white/10'}`}
              title={w.label}>{w.emoji}</button>
          ))}
        </div>
      </div>

      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
        placeholder="日记标题（可选）"
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />

      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="今天发生了什么有趣的事情？" rows={4}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none" />

      {/* 图片上传 */}
      <DiaryImagePicker
        maxImages={5}
        maxSizeMB={10}
        onChange={setImages}
        onError={(message, type) => setDialogConfig({ isOpen: true, message, type })}
      />

      {/* 语音录制 */}
      <div>
        <button onClick={() => setShowVoiceRecorder(true)}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
            audioUrl 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
          }`}>
          <Mic size={16} />
          {audioUrl 
            ? <span>已录制 ({audioDuration}秒) 点击重新录制</span>
            : <span>语音录制</span>
          }
        </button>
        
        {/* 已录制音频的播放 */}
        {audioUrl && (
          <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <audio controls src={audioUrl} className="flex-1 h-8" />
            <button 
              onClick={() => { setAudioUrl(''); setAudioDuration(0); }}
              className="p-1 rounded hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* 保存按钮 */}
      <button onClick={handleCreate} disabled={!content.trim() || uploading}
        className="w-full py-2.5 rounded-lg bg-gradient-to-br from-orange-500/40 to-amber-500/40 hover:from-orange-500/60 hover:to-amber-500/60 disabled:opacity-30 disabled:cursor-not-allowed text-orange-300 text-sm transition-all flex items-center justify-center gap-2">
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>上传中...</span>
          </>
        ) : (
          <>
            <Save size={14} />
            <span>保存日记 (+5 积分)</span>
          </>
        )}
      </button>

      {/* 语音录制弹窗 */}
      <VoiceRecorderModal
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onConfirm={handleVoiceConfirm}
      />

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
}
