import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  const [dots, setDots] = useState('.');

  // Pulsing loading dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
    }, 400);

    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1300); // 1.3 seconds splash loading window

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 bg-[#07111F] z-[10000] flex flex-col items-center justify-center select-none"
    >
      {/* 1. Animated network visualizer mesh */}
      <div className="relative w-24 h-24 mb-6">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Animated line connections */}
          <motion.line
            x1="20" y1="20" x2="80" y2="20"
            stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" strokeDasharray="60"
            initial={{ strokeDashoffset: 60 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
          <motion.line
            x1="80" y1="20" x2="80" y2="80"
            stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" strokeDasharray="60"
            initial={{ strokeDashoffset: 60 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: 0.3 }}
          />
          <motion.line
            x1="80" y1="80" x2="20" y2="80"
            stroke="rgba(124, 58, 237, 0.4)" strokeWidth="1.5" strokeDasharray="60"
            initial={{ strokeDashoffset: 60 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: 0.6 }}
          />
          <motion.line
            x1="20" y1="80" x2="20" y2="20"
            stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" strokeDasharray="60"
            initial={{ strokeDashoffset: 60 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: 0.9 }}
          />
          <motion.line
            x1="20" y1="20" x2="80" y2="80"
            stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" strokeDasharray="80"
            initial={{ strokeDashoffset: 80 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />

          {/* Node dot points */}
          <circle cx="20" cy="20" r="3.5" fill="#3B82F6" className="animate-pulse" />
          <circle cx="80" cy="20" r="3.5" fill="#06B6D4" />
          <circle cx="80" cy="80" r="3.5" fill="#7C3AED" className="animate-pulse" />
          <circle cx="20" cy="80" r="3.5" fill="#3B82F6" />
        </svg>
      </div>

      {/* 2. Brand Name in beautiful gradient text */}
      <h1 className="text-3xl font-extrabold tracking-widest bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent mb-2">
        DevMesh
      </h1>

      {/* 3. Status text */}
      <p className="text-[11px] font-mono tracking-widest text-slate-450 uppercase flex items-center space-x-1">
        <span>Connecting Developers</span>
        <span className="w-6 text-left">{dots}</span>
      </p>
    </motion.div>
  );
};

export default LoadingScreen;
