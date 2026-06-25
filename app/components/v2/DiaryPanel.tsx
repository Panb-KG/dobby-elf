/**
 * 魔法日记面板
 * 
 * 小朋友的文字/语音日记，按日期存储和编辑
 * v2.0 新增
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mic, Square, Plus, Edit3, Trash2, Save, X,
  ChevronLeft, ChevronRight, Search, Calendar,
  Sparkles, BookOpen, Image as ImageIcon,
} from 'lucide-react';
import {
  getDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  getDiaryDates,
  MOOD_OPTIONS,
  WEATHER_OPTIONS,
} from '@/lib/agent/client';
import type { DiaryEntry } from '@/lib/diary';

export default function DiaryPanel() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [diaryDates, setDiaryDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiaryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 新日记表单
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState('');
  const [newWeather, setNewWeather] = useState('');
  const [isVoiceInput, setIsVoiceInput] = useState(false);

  // 编辑表单
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState('');
  const [editWeather, setEditWeather] = useState('');

  // 语音输入 ref
  const recognitionRef = useRef<any>(null);
  const voiceTimerRef = useRef<number | null>(null);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesRes, datesRes] = await Promise.all([
        getDiaryEntries(selectedDate),
        getDiaryDates(30),
      ]);
      setEntries(entriesRes.entries || []);
      setDiaryDates(datesRes.dates || []);
    } catch (e) {
      console.error('加载日记失败', e);
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      const res = await fetch(`/api/diary/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.entries || []);
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  // 创建日记
  const handleCreate = async () => {
    if (!newContent.trim()) return;
    try {
      await createDiaryEntry({
        date: selectedDate,
        title: newTitle.trim() || '无标题',
        content: newContent.trim(),
        mood: newMood || undefined,
        weather: newWeather || undefined,
        isVoice: isVoiceInput,
        voiceDuration: isVoiceInput ? voiceSeconds : undefined,
      });
      // 重置表单
      setNewTitle('');
      setNewContent('');
      setNewMood('');
      setNewWeather('');
      setShowNewForm(false);
      loadData();
    } catch (e: any) {
      alert(e.message || '创建失败');
    }
  };

  // 开始编辑
  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditMood(entry.mood || '');
    setEditWeather(entry.weather || '');
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateDiaryEntry(editingId, {
        title: editTitle || '无标题',
        content: editContent,
        mood: editMood || undefined,
        weather: editWeather || undefined,
      });
      setEditingId(null);
      loadData();
    } catch (e: any) {
      alert(e.message || '保存失败');
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇日记吗？')) return;
    try {
      await deleteDiaryEntry(id);
      loadData();
    } catch (e: any) {
      alert(e.message || '删除失败');
    }
  };

  // 语音输入
  const toggleVoiceInput = useCallback(() => {
    if (isRecording) {
      // 停止录音
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
      }
      setIsRecording(false);
      setIsVoiceInput(true);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('你的浏览器不支持语音输入，请使用 Chrome 浏览器');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      // 实时更新内容
      const currentContent = newContent;
      setNewContent(currentContent + finalTranscript + interimTranscript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setVoiceSeconds(0);
    voiceTimerRef.current = window.setInterval(() => {
      setVoiceSeconds(prev => prev + 1);
    }, 1000);
  }, [isRecording, newContent]);

  // 日期导航
  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const today = new Date().toISOString().split('T')[0];
  const hasEntryOnDate = diaryDates.some(d => d.date === selectedDate);

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
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="搜索日记..."
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
        />
        <button
          onClick={handleSearch}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Search size={16} className="text-gray-400" />
        </button>
      </div>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map(entry => (
            <div
              key={entry.id}
              onClick={() => {
                setSelectedDate(entry.date);
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
            >
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
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-400" />
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-orange-400">
            {formatDate(selectedDate)}
          </div>
          {selectedDate === today && (
            <span className="text-xs text-green-400">今天</span>
          )}
          {hasEntryOnDate && (
            <div className="text-xs text-gray-500">
              {entries.length} 篇日记
            </div>
          )}
        </div>
        <button
          onClick={() => navigateDate(1)}
          disabled={selectedDate >= today}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>

      {/* 快速跳转到有日记的日期 */}
      {diaryDates.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {diaryDates.slice(0, 10).map(d => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs transition-colors ${
                selectedDate === d.date
                  ? 'bg-orange-500/30 text-orange-300'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {d.date.slice(5)}
              {d.moods?.[0] && <span className="ml-1">{d.moods[0]}</span>}
            </button>
          ))}
        </div>
      )}

      {/* 新建按钮 */}
      {!showNewForm ? (
        <button
          onClick={() => setShowNewForm(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-orange-500/30 hover:border-orange-500/60 text-orange-400 hover:text-orange-300 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          写一篇魔法日记 ✨
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-400">✍️ 新日记</span>
            <button
              onClick={() => {
                setShowNewForm(false);
                setNewTitle('');
                setNewContent('');
                setNewMood('');
                setNewWeather('');
              }}
              className="p-1 rounded hover:bg-white/10"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>

          {/* 心情选择 */}
          <div>
            <span className="text-xs text-gray-400">今天的心情</span>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.emoji}
                  onClick={() => setNewMood(newMood === m.emoji ? '' : m.emoji)}
                  className={`px-2 py-1 rounded-lg text-sm transition-all ${
                    newMood === m.emoji
                      ? 'bg-orange-500/30 ring-1 ring-orange-500'
                      : 'hover:bg-white/10'
                  }`}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 天气选择 */}
          <div>
            <span className="text-xs text-gray-400">天气</span>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {WEATHER_OPTIONS.map(w => (
                <button
                  key={w.emoji}
                  onClick={() => setNewWeather(newWeather === w.emoji ? '' : w.emoji)}
                  className={`px-2 py-1 rounded-lg text-sm transition-all ${
                    newWeather === w.emoji
                      ? 'bg-blue-500/30 ring-1 ring-blue-500'
                      : 'hover:bg-white/10'
                  }`}
                  title={w.label}
                >
                  {w.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="日记标题（可选）"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />

          {/* 内容 */}
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="今天发生了什么有趣的事情？"
            rows={4}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
          />

          {/* 语音输入按钮 */}
          <button
            onClick={toggleVoiceInput}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
              isRecording
                ? 'bg-red-500/30 text-red-400 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            {isRecording ? (
              <>
                <Square size={16} />
                <span>停止录音 ({voiceSeconds}s)</span>
              </>
            ) : (
              <>
                <Mic size={16} />
                <span>语音输入</span>
              </>
            )}
          </button>

          {/* 保存按钮 */}
          <button
            onClick={handleCreate}
            disabled={!newContent.trim()}
            className="w-full py-2.5 rounded-lg bg-gradient-to-br from-orange-500/40 to-amber-500/40 hover:from-orange-500/60 hover:to-amber-500/60 disabled:opacity-30 disabled:cursor-not-allowed text-orange-300 text-sm transition-all flex items-center justify-center gap-2"
          >
            <Save size={14} />
            保存日记 (+5 积分)
          </button>
        </div>
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
          <div
            key={entry.id}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            {editingId === entry.id ? (
              /* 编辑模式 */
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
                />
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/50 resize-none"
                />
                {/* 心情编辑 */}
                <div className="flex gap-1 flex-wrap">
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.emoji}
                      onClick={() => setEditMood(editMood === m.emoji ? '' : m.emoji)}
                      className={`px-2 py-0.5 rounded text-sm ${
                        editMood === m.emoji ? 'bg-orange-500/30' : 'hover:bg-white/10'
                      }`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-1.5 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 text-orange-300 text-xs transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 text-xs transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              /* 查看模式 */
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.mood && <span className="text-lg">{entry.mood}</span>}
                    {entry.weather && <span className="text-lg">{entry.weather}</span>}
                    <h4 className="text-sm font-medium text-orange-300">{entry.title}</h4>
                    {entry.isVoice && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">
                        🎤 语音
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(entry)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <Edit3 size={14} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} className="text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
                {entry.voiceDuration && (
                  <div className="mt-2 text-xs text-gray-500">
                    🎤 语音时长 {entry.voiceDuration} 秒
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}
