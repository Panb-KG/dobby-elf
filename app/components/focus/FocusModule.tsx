'use client';

import React from 'react';
import { Hourglass, X, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import type { WhiteNoiseType } from '../../types';

interface FocusModuleProps {
  focusTime: number;
  isFocusActive: boolean;
  isHourglassBroken: boolean;
  whiteNoise: WhiteNoiseType;
  onStartFocus: () => void;
  onPauseFocus: () => void;
  onResetFocus: () => void;
  onSetFocusTime: (minutes: number) => void;
  onToggleWhiteNoise: (type: WhiteNoiseType) => void;
  onFixHourglass: () => void;
}

export function FocusModule({
  focusTime,
  isFocusActive,
  isHourglassBroken,
  whiteNoise,
  onStartFocus,
  onPauseFocus,
  onResetFocus,
  onSetFocusTime,
  onToggleWhiteNoise,
  onFixHourglass,
}: FocusModuleProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presetTimes = [15, 25, 45, 60];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Magic Hourglass */}
      <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-magic-accent to-transparent" />
        </div>

        <div className="relative mb-6">
          <motion.div
            animate={isFocusActive ? { rotate: 180 } : { rotate: 0 }}
            transition={{ 
              duration: 2, 
              repeat: isFocusActive ? Infinity : 0, 
              ease: "easeInOut",
              repeatType: "reverse"
            }}
            className={cn(
              "w-24 h-24 flex items-center justify-center",
              isHourglassBroken && "animate-shake"
            )}
          >
            {isHourglassBroken ? (
              <div className="relative">
                <Hourglass className="w-16 h-16 text-red-500/50" />
                <X className="w-20 h-20 text-red-500 absolute inset-0 mx-auto" />
              </div>
            ) : (
              <Hourglass className={cn(
                "w-16 h-16 transition-colors",
                isFocusActive ? "text-magic-accent" : "text-white/20"
              )} />
            )}
          </motion.div>
        </div>

        <div className="space-y-1 mb-8">
          <h3 className="text-3xl font-mono font-bold text-white tracking-widest">
            {formatTime(focusTime)}
          </h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
            {isFocusActive 
              ? '专注魔法生效中...' 
              : isHourglassBroken 
                ? '魔法沙漏已碎裂' 
                : '准备好开始专注了吗？'
            }
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 w-full mb-6">
          {!isFocusActive ? (
            isHourglassBroken ? (
              <button
                onClick={onFixHourglass}
                className="flex-1 py-3 rounded-xl bg-magic-accent text-white text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 transition-all"
              >
                修复沙漏
              </button>
            ) : (
              <button
                onClick={onStartFocus}
                className="flex-1 py-3 rounded-xl bg-magic-accent text-white text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                开启沙漏
              </button>
            )
          ) : (
            <>
              <button
                onClick={onPauseFocus}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4" />
                暂停
              </button>
              <button
                onClick={onResetFocus}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            </>
          )}
        </div>

        {/* Time Presets */}
        {!isFocusActive && !isHourglassBroken && (
          <div className="grid grid-cols-4 gap-2 w-full">
            {presetTimes.map((mins) => (
              <button
                key={mins}
                onClick={() => onSetFocusTime(mins)}
                className={cn(
                  "py-2 rounded-xl text-xs font-bold transition-all",
                  focusTime === mins * 60
                    ? "bg-magic-accent text-white"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                )}
              >
                {mins}分钟
              </button>
            ))}
          </div>
        )}
      </div>

      {/* White Noise */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">白噪音</h3>
          {whiteNoise !== 'none' && (
            <span className="text-[10px] text-magic-accent font-bold">播放中</span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'library', label: '图书馆', icon: Volume2 },
            { type: 'rain', label: '雨声', icon: Volume2 },
            { type: 'fire', label: '篝火', icon: Volume2 },
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onToggleWhiteNoise(whiteNoise === type ? 'none' : type as WhiteNoiseType)}
              className={cn(
                "py-3 rounded-xl flex flex-col items-center gap-1.5 transition-all",
                whiteNoise === type
                  ? "bg-magic-accent/20 border border-magic-accent/40 text-white"
                  : "bg-white/5 border border-white/5 text-white/40 hover:bg-white/10"
              )}
            >
              <Icon className={cn("w-5 h-5", whiteNoise === type ? "text-magic-accent" : "")} />
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>

        {whiteNoise !== 'none' && (
          <button
            onClick={() => onToggleWhiteNoise('none')}
            className="w-full py-2 rounded-xl bg-white/5 text-white/40 text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <VolumeX className="w-4 h-4" />
            关闭白噪音
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-[10px] text-white/40 leading-relaxed">
          💡 <span className="text-white/60">专注小贴士：</span>
          番茄工作法建议 25 分钟专注 +5 分钟休息，多比推荐你从 25 分钟开始哦！
        </p>
      </div>
    </div>
  );
}
