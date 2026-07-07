/**
 * 语音录制弹窗
 *
 * 使用 MediaRecorder 录制音频，AudioContext + AnalyserNode 显示电平
 * 支持：录音、暂停/继续、回放、重录、确认
 */

"use client";

import { Mic, Pause, Play, Square, RotateCcw, Check, X, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { AudioLevelBars } from '@/components/v2/AudioLevelBars';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (audioBlob: Blob, durationSeconds: number) => void;
  maxDurationMs?: number; // 默认 5 分钟
}

export function VoiceRecorderModal({
  isOpen,
  onClose,
  onConfirm,
  maxDurationMs = 300000,
}: VoiceRecorderModalProps) {
  const {
    state,
    duration,
    level,
    isPlaying,
    uploading,
    startRecording,
    togglePause,
    stopRecording,
    playRecording,
    stopPlaying,
    reRecord,
    confirmRecording,
    formatTime,
    handleClose,
  } = useAudioRecorder({ onConfirm, maxDurationMs, isOpen, onClose });

  if (!isOpen) return null;

  const barCount = 24;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-[90vw] max-w-sm p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-orange-400">🎤 语音录制</h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-white/10">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* 时长显示 */}
        <div className="text-center mb-4">
          <div className={`text-3xl font-mono font-bold ${state === 'recording' ? 'text-red-400' : state === 'paused' ? 'text-yellow-400' : 'text-white'}`}>
            {formatTime(duration)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {state === 'idle' && '点击下方按钮开始录音'}
            {state === 'recording' && '正在录音...'}
            {state === 'paused' && '已暂停'}
            {state === 'stopped' && '录音完成，可以回放或重录'}
          </div>
        </div>

        {/* 电平可视化 */}
        <AudioLevelBars level={level} barCount={barCount} />

        {/* 录音中的脉冲动画 */}
        {state === 'recording' && (
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center">
                  <Mic size={20} className="text-red-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-3">
          {/* idle 状态：开始录音 */}
          {state === 'idle' && (
            <button onClick={startRecording}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30">
              <Mic size={24} className="text-white" />
            </button>
          )}

          {/* recording/paused 状态：暂停/继续 + 停止 */}
          {(state === 'recording' || state === 'paused') && (
            <>
              <button onClick={togglePause}
                className="w-12 h-12 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 flex items-center justify-center transition-colors border border-yellow-500/30">
                <Pause size={20} className="text-yellow-400" />
              </button>
              <button onClick={stopRecording}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30">
                <Square size={22} className="text-white" />
              </button>
            </>
          )}

          {/* stopped 状态：播放/停止 + 重录 + 确认 */}
          {state === 'stopped' && (
            <>
              <button onClick={isPlaying ? stopPlaying : playRecording}
                className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors border border-blue-500/30">
                {isPlaying ? <Square size={18} className="text-blue-400" /> : <Play size={20} className="text-blue-400" />}
              </button>
              <button onClick={reRecord}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <RotateCcw size={18} className="text-gray-400" />
              </button>
              <button onClick={confirmRecording} disabled={uploading}
                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50">
                {uploading ? <Loader2 size={22} className="text-white animate-spin" /> : <Check size={24} className="text-white" />}
              </button>
            </>
          )}
        </div>

        {/* 提示文字 */}
        <div className="text-center mt-3">
          <p className="text-[10px] text-gray-600">最长录音 {Math.floor(maxDurationMs / 60000)} 分钟</p>
        </div>
      </div>
    </div>
  );
}
