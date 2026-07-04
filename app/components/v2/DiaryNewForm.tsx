/**
 * 魔法日记 - 新建日记表单
 */

"use client";

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Save, X, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { MOOD_OPTIONS, WEATHER_OPTIONS } from './diary-constants';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { uploadMultipleImages, validateImageFile } from '@/lib/supabase-storage';

interface DiaryNewFormProps {
  selectedDate: string;
  userId: string; // 新增：用户 ID
  onCreate: (data: {
    date: string;
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    isVoice: boolean;
    voiceDuration?: number;
    images?: string[]; // 新增：图片 URL 数组
  }) => Promise<void>;
  onCancel: () => void;
}

export function DiaryNewForm({ selectedDate, userId, onCreate, onCancel }: DiaryNewFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const [isVoice, setIsVoice] = useState(false);
  const [images, setImages] = useState<File[]>([]); // 新增：待上传图片
  const [imageUrls, setImageUrls] = useState<string[]>([]); // 新增：已上传 URL
  const [uploading, setUploading] = useState(false); // 新增：上传中状态

  // 对话框状态
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({ isOpen: false, message: '', type: 'info' });

  const recognitionRef = useRef<any>(null);
  const voiceTimerRef = useRef<number | null>(null);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const toggleVoiceInput = useCallback(() => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      setIsRecording(false);
      setIsVoice(true);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      // 使用 ConfirmDialog 替代 alert
      setDialogConfig({ isOpen: true, message: '你的浏览器不支持语音输入，请使用 Chrome 浏览器', type: 'warning' });
      return;
    }

    const recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      setContent(prev => prev + finalTranscript + interim);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      setIsRecording(false);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setVoiceSeconds(0);
    voiceTimerRef.current = window.setInterval(() => setVoiceSeconds(p => p + 1), 1000);
  }, [isRecording]);

  const handleCreate = async () => {
    if (!content.trim()) return;
    
    setUploading(true);
    try {
      // 上传图片
      let uploadedUrls: string[] = [];
      if (images.length > 0) {
        uploadedUrls = await uploadMultipleImages(images, userId);
      }
      
      await onCreate({
        date: selectedDate,
        title: title.trim() || '无标题',
        content: content.trim(),
        mood: mood || undefined,
        weather: weather || undefined,
        isVoice,
        voiceDuration: isVoice ? voiceSeconds : undefined,
        images: uploadedUrls,
      });
      
      setTitle('');
      setContent('');
      setMood('');
      setWeather('');
      setImages([]);
      setImageUrls([]);
    } catch (error: any) {
      setDialogConfig({ 
        isOpen: true, 
        message: error.message || '图片上传失败', 
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">📸 添加照片</span>
          {images.length > 0 && (
            <span className="text-xs text-orange-400">已选择 {images.length} 张</span>
          )}
        </div>
        
        {/* 图片预览 */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-white/10">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`预览 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setImages(prev => prev.filter((_, i) => i !== idx));
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* 选择按钮 */}
        <label className="w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer">
          <ImageIcon size={16} />
          <span>选择照片（最多 5 张）</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              
              // 验证文件
              const validFiles: File[] = [];
              for (const file of files) {
                const validation = validateImageFile(file, 10);
                if (!validation.valid) {
                  setDialogConfig({ isOpen: true, message: validation.error!, type: 'warning' });
                  return;
                }
                validFiles.push(file);
              }
              
              // 限制最多 5 张
              const newImages = [...images, ...validFiles].slice(0, 5);
              setImages(newImages);
            }}
          />
        </label>
      </div>

      <button onClick={toggleVoiceInput}
        className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${isRecording ? 'bg-red-500/30 text-red-400 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}>
        {isRecording ? <><Square size={16} /><span>停止录音 ({voiceSeconds}s)</span></> : <><Mic size={16} /><span>语音输入</span></>}
      </button>

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
