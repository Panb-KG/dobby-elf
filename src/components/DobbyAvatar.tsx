import React from 'react';
import { motion } from 'motion/react';

export const DobbyAvatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20"
  };

  return (
    <motion.div 
      className={`${sizes[size]} relative flex items-center justify-center`}
      animate={{ 
        y: [0, -4, 0],
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-magic-accent/20 blur-xl rounded-full animate-pulse" />
      
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
        {/* Ears */}
        <motion.path
          d="M20 45 Q10 30 25 35"
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.path
          d="M80 45 Q90 30 75 35"
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [5, -5, 5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Body/Face */}
        <circle cx="50" cy="55" r="35" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
        
        {/* Eyes */}
        <g>
          <motion.circle 
            cx="35" cy="50" r="5" fill="#10b981"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.circle 
            cx="65" cy="50" r="5" fill="#10b981"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </g>

        {/* Mouth */}
        <motion.path
          d="M40 70 Q50 78 60 70"
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ d: ["M40 70 Q50 78 60 70", "M42 72 Q50 75 58 72", "M40 70 Q50 78 60 70"] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Magic Sparkles */}
        <motion.circle
          cx="20" cy="20" r="2" fill="#fbbf24"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.circle
          cx="85" cy="75" r="1.5" fill="#fbbf24"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </svg>
    </motion.div>
  );
};
