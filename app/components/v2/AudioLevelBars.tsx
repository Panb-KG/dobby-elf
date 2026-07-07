/**
 * 音频电平可视化 — 24 根柱形条，颜色随电平变化
 */

"use client";

import { memo } from 'react';

interface AudioLevelBarsProps {
  level: number;
  barCount?: number;
}

export const AudioLevelBars = memo(function AudioLevelBars({ level, barCount = 24 }: AudioLevelBarsProps) {
  const bars = Array.from({ length: barCount }, (_, i) => {
    const threshold = (i / barCount) * 100;
    const active = level > threshold;
    const height = active ? 30 + Math.random() * 70 : 15 + Math.random() * 10;
    return { active, height };
  });

  return (
    <div className="flex items-end justify-center gap-[2px] h-16 mb-4 px-2">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-[6px] rounded-t transition-all duration-75"
          style={{
            height: `${bar.height}%`,
            backgroundColor: bar.active
              ? i > barCount * 0.7
                ? '#ef4444'
                : i > barCount * 0.4
                  ? '#f59e0b'
                  : '#22c55e'
              : 'rgba(255,255,255,0.1)',
          }}
        />
      ))}
    </div>
  );
});
