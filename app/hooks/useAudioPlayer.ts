"use client";

/**
 * useAudioPlayer - 白噪音音频管理 Hook
 * 
 * 管理背景白噪音的播放、暂停、音量控制。
 */

import { useRef, useEffect, useCallback, useState } from 'react';

export type WhiteNoiseId = 'none' | 'library' | 'rain' | 'fire';

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  play: (noiseId: WhiteNoiseId) => void;
  pause: () => void;
  stop: () => void;
}

const AUDIO_URLS: Record<Exclude<WhiteNoiseId, 'none'>, string> = {
  library: '/audio/library.mp3',
  rain: '/audio/rain.mp3',
  fire: '/audio/fireplace.mp3',
};

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const play = useCallback((noiseId: WhiteNoiseId) => {
    if (!audioRef.current || noiseId === 'none') return;
    const url = AUDIO_URLS[noiseId];
    if (!url) return;

    if (audioRef.current.src !== url) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
    audioRef.current.play().catch(() => {
      // 浏览器自动播放策略限制，静默失败
    });
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
  }, []);

  return { isPlaying, play, pause, stop };
}
