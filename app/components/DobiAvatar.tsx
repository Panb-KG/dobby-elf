import React from 'react';
import { motion } from 'motion/react';

interface DobiAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const DobiAvatar = ({ size = "md", className = "" }: DobiAvatarProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20"
  };

  const sizeClasses = {
    sm: {
      head: "w-6 h-7 rounded-[8px_8px_6px_6px]",
      face: "w-5 h-5 rounded-full",
      eye: "w-1.5 h-1.5",
      glow: "w-4 h-2",
    },
    md: {
      head: "w-10 h-12 rounded-[16px_16px_12px_12px]",
      face: "w-8 h-8 rounded-full",
      eye: "w-3 h-3",
      glow: "w-8 h-3",
    },
    lg: {
      head: "w-16 h-20 rounded-[24px_24px_16px_16px]",
      face: "w-12 h-12 rounded-full",
      eye: "w-4 h-4",
      glow: "w-12 h-4",
    },
  };

  const s = sizeClasses[size];

  return (
    <motion.div 
      className={`${sizes[size]} relative flex items-center justify-center ${className}`}
      animate={{ 
        y: [0, -3, 0],
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* Glow effect */}
      <div className={`absolute ${s.glow} bg-amber-600/20 blur-lg rounded-full`} />
      
      {/* Head / Hood */}
      <div className={`${s.head} bg-[#18181b] border border-white/10 relative shadow-lg overflow-hidden flex items-center justify-center`}>
        {/* Inner Face */}
        <div className={`${s.face} bg-[#0F0F11] border border-white/5 flex items-center justify-center`}>
          {/* Eyes */}
          <div className="flex gap-1">
            <motion.div 
              animate={{ scaleY: [1, 1, 0.1, 1] }} 
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }}
              className={`${s.eye} bg-[#D97706] rounded-full shadow-[0_0_8px_rgba(217,119,6,0.6)]`} 
            />
            <motion.div 
              animate={{ scaleY: [1, 1, 0.1, 1] }} 
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }}
              className={`${s.eye} bg-[#D97706] rounded-full shadow-[0_0_8px_rgba(217,119,6,0.6)]`} 
            />
          </div>
        </div>
      </div>

      {/* Magic Sparkles */}
      <motion.div
        className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-400 rounded-full"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
};
