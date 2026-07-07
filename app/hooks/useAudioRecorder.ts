/**
 * 语音录制 hook
 *
 * 封装 MediaRecorder 录制、AudioContext + AnalyserNode 电平监测、
 * 回放、重录、确认等全部录音逻辑。
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

interface UseAudioRecorderOptions {
  onConfirm: (audioBlob: Blob, durationSeconds: number) => void;
  maxDurationMs: number;
  isOpen: boolean;
  onClose: () => void;
}

interface UseAudioRecorderReturn {
  state: RecordingState;
  duration: number;
  level: number;
  isPlaying: boolean;
  uploading: boolean;
  audioUrl: string;
  startRecording: () => void;
  togglePause: () => void;
  stopRecording: () => void;
  playRecording: () => void;
  stopPlaying: () => void;
  reRecord: () => void;
  confirmRecording: () => void;
  cleanup: () => void;
  formatTime: (seconds: number) => string;
  handleClose: () => void;
}

export function useAudioRecorder({
  onConfirm,
  maxDurationMs,
  isOpen,
  onClose,
}: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string>('');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const maxTimerRef = useRef<number>(0);

  // 清理所有资源
  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = '';
    }
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    chunksRef.current = [];
    audioBlobRef.current = null;
    pausedDurationRef.current = 0;
  }, []);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    cleanup();
    setState('idle');
    setDuration(0);
    setLevel(0);
    setIsPlaying(false);
    setUploading(false);
    onClose();
  }, [cleanup, onClose]);

  // 更新电平表
  const updateLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
    setLevel(Math.min(100, Math.round((avg / 128) * 100)));
    animFrameRef.current = requestAnimationFrame(updateLevel);
  }, []);

  // 更新计时器
  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsed = Date.now() - startTimeRef.current - pausedDurationRef.current;
    setDuration(Math.floor(elapsed / 1000));
  }, []);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      cleanup();
      chunksRef.current = [];
      audioBlobRef.current = null;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        audioBlobRef.current = blob;
        audioUrlRef.current = URL.createObjectURL(blob);
        setLevel(0);
        setState('stopped');
      };

      recorder.start(100);
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      setState('recording');

      animFrameRef.current = requestAnimationFrame(updateLevel);
      timerRef.current = window.setInterval(updateTimer, 200);
      maxTimerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording' || recorder.state === 'paused') {
          recorder.stop();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, maxDurationMs);
    } catch (err) {
      console.error('[VoiceRecorder] 无法获取麦克风:', err);
      alert('无法访问麦克风，请检查浏览器权限');
    }
  }, [cleanup, updateLevel, updateTimer, maxDurationMs]);

  // 暂停/继续
  const togglePause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (state === 'recording') {
      recorder.pause();
      setState('paused');
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else if (state === 'paused') {
      recorder.resume();
      setState('recording');
      animFrameRef.current = requestAnimationFrame(updateLevel);
    }
  }, [state, updateLevel]);

  // 停止录制
  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setLevel(0);
  }, []);

  // 播放录音
  const playRecording = useCallback(() => {
    if (!audioUrlRef.current || isPlaying) return;
    const audio = new Audio(audioUrlRef.current);
    audioElementRef.current = audio;
    audio.onended = () => {
      setIsPlaying(false);
      audioElementRef.current = null;
    };
    audio.play();
    setIsPlaying(true);
  }, [isPlaying]);

  // 停止播放
  const stopPlaying = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // 重新录制
  const reRecord = useCallback(() => {
    stopPlaying();
    setDuration(0);
    setLevel(0);
    setState('idle');
    setTimeout(() => startRecording(), 100);
  }, [stopPlaying, startRecording]);

  // 确认录制
  const confirmRecording = useCallback(async () => {
    if (!audioBlobRef.current) return;
    setUploading(true);
    onConfirm(audioBlobRef.current, duration);
  }, [duration, onConfirm]);

  // 弹窗关闭时清理
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setState('idle');
      setDuration(0);
      setLevel(0);
    }
  }, [isOpen, cleanup]);

  // 格式化时间 mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    state,
    duration,
    level,
    isPlaying,
    uploading,
    audioUrl: audioUrlRef.current,
    startRecording,
    togglePause,
    stopRecording,
    playRecording,
    stopPlaying,
    reRecord,
    confirmRecording,
    cleanup,
    formatTime,
    handleClose,
  };
}
