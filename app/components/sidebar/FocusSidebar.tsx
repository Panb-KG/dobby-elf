/**
 * 专注侧边栏组件
 */

"use client";

import { motion } from 'motion/react';
import { VolumeX, Library, Flame, CloudRain, RotateCcw, Hourglass } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { UseFocusReturn } from '../../hooks/useFocus';

export interface FocusSidebarProps {
  focus: UseFocusReturn;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function FocusSidebarContent({ focus, audioRef }: FocusSidebarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const whiteNoiseOptions = [
    { id: 'none' as const, name: '静音', icon: VolumeX },
    { id: 'library' as const, name: '魔法图书馆', icon: Library },
    { id: 'rain' as const, name: '禁林细雨', icon: CloudRain },
    { id: 'fire' as const, name: '休息室壁炉', icon: Flame },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-magic-accent to-transparent" />
        </div>
        <div className="relative mb-6">
          <motion.div animate={focus.isFocusing ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 2, repeat: focus.isFocusing ? Infinity : 0, ease: "easeInOut" }} className="w-24 h-24 flex items-center justify-center">
            <Hourglass className={cn("w-16 h-16 transition-colors", focus.isFocusing ? "text-magic-accent" : "text-white/20")} />
          </motion.div>
        </div>
        <div className="space-y-1 mb-8">
          <h3 className="text-3xl font-mono font-bold text-white tracking-widest">{formatTime(focus.elapsedTime)}</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{focus.isFocusing ? '专注魔法生效中...' : '准备好开始专注了吗？'}</p>
        </div>
        <div className="flex gap-3 w-full">
          {!focus.isFocusing ? (
            <button onClick={() => focus.startFocus(25)} className="flex-1 py-3 rounded-xl bg-magic-accent text-white text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 transition-all">开启沙漏</button>
          ) : (
            <button onClick={focus.pauseFocus} className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all">暂停魔法</button>
          )}
          {(focus.elapsedTime < focus.duration && !focus.isFocusing) && (
            <button onClick={focus.stopFocus} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"><RotateCcw className="w-4 h-4" /></button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">背景魔法音</h3>
        <div className="grid grid-cols-2 gap-2">
          {whiteNoiseOptions.map(sound => (
            <button key={sound.id} onClick={() => { focus.setWhiteNoise(sound.id); if (sound.id !== 'none' && audioRef.current) audioRef.current.play().catch(() => {}); }} className={cn(
              "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
              focus.whiteNoise === sound.id ? "bg-magic-accent/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            )}>
              <sound.icon className="w-5 h-5" /><span className="text-[10px] font-bold">{sound.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-[10px] text-white/60 leading-relaxed"><span className="text-white font-bold">魔法提示：</span>在沙漏开启期间，请不要离开这个页面。如果你切换标签页，魔法沙漏就会碎掉哦！</p>
      </div>
    </div>
  );
}
