/**
 * 魔法日记 - 新建日记表单
 */

"use client";

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Save, X, Plus } from 'lucide-react';
import { MOOD_OPTIONS, WEATHER_OPTIONS } from './diary-constants';

interface DiaryNewFormProps {
  selectedDate: string;
  onCreate: (data: {
    date: string;
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    isVoice: boolean;
    voiceDuration?: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function DiaryNewForm({ selectedDate, onCreate, onCancel }: DiaryNewFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const [isVoice, setIsVoice] = useState(false);

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
    if (!SR) { alert('你的浏览器不支持语音输入，请使用 Chrome 浏览器'); return; }

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
    await onCreate({
      date: selectedDate,
      title: title.trim() || '无标题',
      content: content.trim(),
      mood: mood || undefined,
      weather: weather || undefined,
      isVoice,
      voiceDuration: isVoice ? voiceSeconds : undefined,
    });
    setTitle(''); setContent(''); setMood(''); setWeather('');
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

      <button onClick={toggleVoiceInput}
        className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${isRecording ? 'bg-red-500/30 text-red-400 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}>
        {isRecording ? <><Square size={16} /><span>停止录音 ({voiceSeconds}s)</span></> : <><Mic size={16} /><span>语音输入</span></>}
      </button>

      <button onClick={handleCreate} disabled={!content.trim()}
        className="w-full py-2.5 rounded-lg bg-gradient-to-br from-orange-500/40 to-amber-500/40 hover:from-orange-500/60 hover:to-amber-500/60 disabled:opacity-30 disabled:cursor-not-allowed text-orange-300 text-sm transition-all flex items-center justify-center gap-2">
        <Save size={14} />保存日记 (+5 积分)
      </button>
    </div>
  );
}
