import { motion } from 'motion/react';

export const DobiMascot = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    {/* Ears as Braces */}
    <div className="absolute top-10 -left-6 text-brand-accent/40 font-black text-[120px] select-none scale-y-[1.4] transition-transform group-hover:scale-y-[1.5] group-hover:text-amber-600 duration-700">{"{"}</div>
    <div className="absolute top-10 -right-6 text-brand-accent/40 font-black text-[120px] select-none scale-y-[1.4] transition-transform group-hover:scale-y-[1.5] group-hover:text-amber-600 duration-700">{"}"}</div>
    
    {/* Head / Hood */}
    <div className="w-56 h-64 bg-[#18181b] rounded-[60px_60px_40px_40px] border-2 border-white/5 relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Inner Face Case */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-44 h-44 bg-[#0F0F11] rounded-full border border-white/5 flex flex-col items-center justify-center">
        {/* Glow behind eyes */}
        <div className="absolute w-32 h-12 bg-amber-600/10 blur-xl top-16" />
        
        {/* Eyes */}
        <div className="flex gap-10 mt-2">
          <motion.div 
            animate={{ scaleY: [1, 1, 0.1, 1] }} 
            transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }}
            className="w-10 h-10 bg-[#D97706] rounded-full shadow-[0_0_20px_rgba(217,119,6,0.6)]" 
          />
          <motion.div 
            animate={{ scaleY: [1, 1, 0.1, 1] }} 
            transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }}
            className="w-10 h-10 bg-[#D97706] rounded-full shadow-[0_0_20px_rgba(217,119,6,0.6)]" 
          />
        </div>
        
        {/* Digital Mouth/Lines */}
        <div className="mt-8 flex gap-1 items-center">
          <div className="w-1 h-3 bg-amber-600/40 rounded-full" />
          <div className="w-1 h-1 bg-amber-600/40 rounded-full" />
          <div className="w-1 h-1 bg-amber-600/40 rounded-full" />
          <div className="w-1 h-3 bg-amber-600/40 rounded-full" />
        </div>
      </div>
      
      {/* Hoodie Details */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-50">
        <div className="w-1 h-4 bg-zinc-500 rounded-full" />
        <div className="w-1 h-4 bg-zinc-500 rounded-full" />
      </div>
    </div>
    
    {/* Body Shadow Overlay */}
    <div className="absolute bottom-0 w-48 h-12 bg-black/60 blur-3xl -z-10" />
  </div>
);

export default DobiMascot;
