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
  // 使用可靠的免费音频CDN（Pixabay）
  library: 'https://cdn.pixabay.com/audio/2022/05/17/audio_1590407870.mp3',
  rain: 'https://cdn.pixabay.com/audio/2022/03/10/audio_a2c0c7c7e4.mp3',
  fire: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a1f6a3c0.mp3',
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
