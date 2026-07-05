"use client";

import { useRef, useEffect } from 'react';
import type { WhiteNoiseType } from '../../types';

const NOISE_URLS: Record<string, string> = {
  library: 'https://www.soundjay.com/ambient/library-ambience-01.mp3',
  rain: 'https://www.soundjay.com/nature/rain-01.mp3',
  fire: 'https://www.soundjay.com/household/fireplace-01.mp3',
};

/**
 * useWhiteNoise - 白噪音 Audio 管理
 * 根据白噪音类型切换音频源并自动播放/暂停
 */
export function useWhiteNoise(whiteNoise: WhiteNoiseType) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    const audio = audioRef.current;
    if (whiteNoise !== 'none') {
      const targetUrl = NOISE_URLS[whiteNoise];
      if (audio.src !== targetUrl) {
        audio.src = targetUrl;
        audio.load();
      }
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    return () => { audio.pause(); };
  }, [whiteNoise]);

  return audioRef;
}
