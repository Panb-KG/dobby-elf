"use client";

/**
 * VoiceButton - 语音聊天按钮组件
 * 
 * 为小学生设计的语音交互入口：
 * - 大圆形按钮，适合触控
 * - 录音时有脉冲动画
 * - 显示实时识别文字
 * - 支持点击/长按两种模式
 * - 一键朗读 AI 回复
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, SquareIcon as Stop, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  /** 是否正在录音 */
  isRecording: boolean;
  /** 实时识别文本 */
  interimText: string;
  /** 最终识别结果 */
  finalText: string;
  /** 是否正在朗读 */
  isSpeaking: boolean;
  /** 是否支持语音识别 */
  isSpeechRecognitionSupported: boolean;
  /** 是否支持语音合成 */
  isSpeechSynthesisSupported: boolean;
  /** 自动朗读 */
  autoSpeak: boolean;
  /** 开始录音 */
  onStartRecording: () => void;
  /** 停止录音 */
  onStopRecording: () => void;
  /** 取消录音 */
  onCancelRecording: () => void;
  /** 朗读文本 */
  onSpeak: (text: string) => void;
  /** 停止朗读 */
  onStopSpeaking: () => void;
  /** 切换自动朗读 */
  onToggleAutoSpeak: () => void;
  /** 提交语音识别结果 */
  onSubmitText: (text: string) => void;
  /** 朗读最后一条 AI 消息 */
  onSpeakLastMessage?: () => void;
  /** 当前聊天模式 */
  mode: 'tap' | 'hold';
  /** 切换聊天模式 */
  onToggleMode: () => void;
}

export function VoiceButton({
  isRecording,
  interimText,
  finalText,
  isSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  autoSpeak,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSubmitText,
  onSpeakLastMessage,
  mode,
  onToggleMode,
  onStopSpeaking,
}: VoiceButtonProps) {
  // 如果两个 API 都不支持，不渲染
  if (!isSpeechRecognitionSupported && !isSpeechSynthesisSupported) {
    return null;
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* 语音识别状态提示 */}
      <AnimatePresence>
        {isRecording && (interimText || finalText) && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="absolute bottom-full mb-3 left-0 right-0 bg-black/80 backdrop-blur-sm rounded-2xl p-3 border border-white/10 z-10"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">
                {mode === 'hold' ? '按住说话中...' : '语音识别中...'}
              </span>
            </div>
            {interimText && (
              <p className="text-sm text-white/50 italic">{interimText}</p>
            )}
            {finalText && (
              <p className="text-sm text-white/80">{finalText}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主麦克风按钮 */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onPointerDown={(e) => {
          if (mode === 'hold' && !isRecording) {
            onStartRecording();
          }
        }}
        onPointerUp={() => {
          if (mode === 'hold' && isRecording) {
            onStopRecording();
          }
        }}
        onPointerLeave={() => {
          if (mode === 'hold' && isRecording) {
            onStopRecording();
          }
        }}
        onClick={() => {
          if (mode === 'tap') {
            if (isRecording) {
              onStopRecording();
            } else {
              onStartRecording();
            }
          }
        }}
        className={cn(
          "relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0",
          isRecording
            ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
            : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
        )}
        title={
          mode === 'hold' ? '按住说话' :
          isRecording ? '点击停止录音' : '点击开始语音输入'
        }
      >
        {/* 录音脉冲动画 */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
        </AnimatePresence>

        {isRecording ? (
          <Stop className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <Mic className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </motion.button>

      {/* 朗读按钮（AI 回复朗读） */}
      {isSpeechSynthesisSupported && onSpeakLastMessage && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isSpeaking ? onStopSpeaking : onSpeakLastMessage}
          className={cn(
            "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0",
            isSpeaking
              ? "bg-magic-accent/80 text-white shadow-lg shadow-magic-accent/30"
              : "bg-white/10 text-white/40 hover:bg-white/15 hover:text-white/60"
          )}
          title={isSpeaking ? '停止朗读' : '朗读回复'}
        >
          {isSpeaking ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </motion.button>
      )}

      {/* 模式切换按钮 */}
      {isSpeechRecognitionSupported && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMode}
          className="w-7 h-7 rounded-full bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 flex items-center justify-center transition-all flex-shrink-0"
          title={mode === 'tap' ? '切换为按住说话' : '切换为点击说话'}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
}
