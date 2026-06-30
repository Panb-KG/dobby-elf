"use client";

/**
 * useVoiceChat - 语音聊天 Hook
 *
 * 为小学生设计的语音交互方案：
 * - 本地 SpeechRecognition（语音转文字）：零延迟、免费、支持中文
 * - 本地 SpeechSynthesis（文字转语音）：即时朗读 AI 回复
 * - 语音模式：点击说话 / 按住说话
 * - 自动朗读 AI 回复（可选开关）
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type {
  VoiceChatMode, VoiceChatState,
  SpeechRecognitionEvent, SpeechRecognitionErrorEvent,
  SpeechRecognitionInstance, SpeechRecognitionConstructor,
} from './voice-chat-types';

export function useVoiceChat(options: {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
} = {}): VoiceChatState {
  const { onResult, onError } = options;

  // 检测浏览器支持
  const SpeechRecognitionClass = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : undefined;

  const isSpeechRecognitionSupported = !!SpeechRecognitionClass;
  const isSpeechSynthesisSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  // 状态
  const [mode, setMode] = useState<VoiceChatMode>('tap');
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [volume, setVolumeState] = useState(0.8);
  const [rate, setRateState] = useState(1.0);

  // Refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRecordingRef = useRef(false);

  // ===== 语音识别 =====

  const createRecognition = useCallback(() => {
    if (!SpeechRecognitionClass) return null;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (interim) setInterimText(interim);
      if (final) { setFinalText(prev => prev + final); setInterimText(''); }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      onError?.(`${event.error}: ${event.message}`);
    };

    recognition.onend = () => {
      if (isRecordingRef.current && recognitionRef.current) {
        try { recognition.start(); } catch { setIsRecording(false); isRecordingRef.current = false; }
      } else { setIsRecording(false); isRecordingRef.current = false; }
    };

    recognition.onstart = () => { setIsRecording(true); isRecordingRef.current = true; };
    return recognition;
  }, [SpeechRecognitionClass, onError]);

  const startRecording = useCallback(() => {
    if (!isSpeechRecognitionSupported) { onError?.('浏览器不支持语音识别，请使用 Chrome 或 Edge'); return; }
    setFinalText(''); setInterimText('');
    const recognition = createRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    isRecordingRef.current = true;
    try { recognition.start(); } catch { onError?.('无法启动语音识别，请检查麦克风权限'); }
  }, [isSpeechRecognitionSupported, createRecognition, onError]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsRecording(false);
  }, []);

  const cancelRecording = useCallback(() => {
    isRecordingRef.current = false;
    setFinalText(''); setInterimText('');
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null; }
    setIsRecording(false);
  }, []);

  // ===== 语音合成 =====

  const speak = useCallback((text: string) => {
    if (!isSpeechSynthesisSupported) return;
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/#{1,6}\s?/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1').replace(/```[\s\S]*?```/g, '代码块')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/[-*]\s/g, '').replace(/\n+/g, '。').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    utterance.volume = volume; utterance.rate = rate; utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh')) || voices.find(v => v.lang.startsWith('cmn'));
    if (zhVoice) utterance.voice = zhVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isSpeechSynthesisSupported, volume, rate]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); setIsSpeaking(false);
    }
  }, []);

  // ===== 模式切换 =====

  const toggleMode = useCallback(() => setMode(prev => prev === 'tap' ? 'hold' : 'tap'), []);
  const toggleAutoSpeak = useCallback(() => setAutoSpeak(prev => !prev), []);
  const setVolume = useCallback((v: number) => setVolumeState(Math.max(0, Math.min(1, v))), []);
  const setRate = useCallback((r: number) => setRateState(Math.max(0.5, Math.min(2, r))), []);
  const resetFinalText = useCallback(() => setFinalText(''), []);

  useEffect(() => {
    return () => { if (isRecordingRef.current) cancelRecording(); stopSpeaking(); };
  }, [cancelRecording, stopSpeaking]);

  useEffect(() => {
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
    }
  }, [isSpeechSynthesisSupported]);

  useEffect(() => {
    if (finalText && !isRecording) onResult?.(finalText);
  }, [finalText, isRecording, onResult]);

  return useMemo(() => ({
    mode, isRecording, interimText, finalText, isSpeaking,
    isSpeechRecognitionSupported, isSpeechSynthesisSupported, autoSpeak,
    volume, rate, startRecording, stopRecording, cancelRecording,
    toggleMode, toggleAutoSpeak, setVolume, setRate, speak, stopSpeaking, resetFinalText,
  }), [
    mode, isRecording, interimText, finalText, isSpeaking,
    isSpeechRecognitionSupported, isSpeechSynthesisSupported, autoSpeak,
    volume, rate, startRecording, stopRecording, cancelRecording,
    toggleMode, toggleAutoSpeak, setVolume, setRate, speak, stopSpeaking, resetFinalText,
  ]);
}
