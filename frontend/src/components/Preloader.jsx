import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Keep it snappy: auto-complete after 2.2s
    const timer = setTimeout(() => {
      setIsDone(true);
      setTimeout(onComplete, 400); // exit animation buffer
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // SVG drawing configuration
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: 'easeInOut' },
    },
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (customDelay) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: customDelay,
      },
    }),
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#0B0F19] overflow-hidden"
        >
          {/* Drifting Background Mesh */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-2 h-2 rounded-full bg-brand-primary animate-drift"></div>
            <div className="absolute top-[40%] left-[70%] w-3 h-3 rounded-full bg-brand-accent animate-drift" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[70%] left-[15%] w-2 h-2 rounded-full bg-brand-primary animate-drift" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-[80%] left-[60%] w-2.5 h-2.5 rounded-full bg-brand-accent animate-drift" style={{ animationDelay: '1s' }}></div>

            <svg className="absolute inset-0 w-full h-full">
              <line x1="20%" y1="10%" x2="70%" y2="40%" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="70%" y1="40%" x2="60%" y2="80%" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="15%" y1="70%" x2="60%" y2="80%" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="5,5" />
            </svg>
          </div>

          {/* SVG assembling D-M node mark */}
          <div className="relative flex flex-col items-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 100 100"
              className="mb-6 drop-shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            >
              {/* Mesh connection paths */}
              <motion.path
                d="M25,25 L55,25 M25,25 L25,75 M25,75 L55,75 M55,25 L75,50 M75,50 L55,75"
                fill="transparent"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
              />
              <motion.path
                d="M55,25 L55,75 M55,25 L75,25 M75,25 L75,75"
                fill="transparent"
                stroke="#7C3AED"
                strokeWidth="2.5"
                strokeLinecap="round"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
              />

              {/* Mesh Nodes (circles) */}
              <motion.circle cx="25" cy="25" r="4.5" fill="#2563EB" variants={nodeVariants} custom={0.2} initial="hidden" animate="visible" />
              <motion.circle cx="55" cy="25" r="4.5" fill="#2563EB" variants={nodeVariants} custom={0.4} initial="hidden" animate="visible" />
              <motion.circle cx="25" cy="75" r="4.5" fill="#2563EB" variants={nodeVariants} custom={0.6} initial="hidden" animate="visible" />
              <motion.circle cx="55" cy="75" r="4.5" fill="#7C3AED" variants={nodeVariants} custom={0.8} initial="hidden" animate="visible" />
              <motion.circle cx="75" cy="50" r="5" fill="#7C3AED" variants={nodeVariants} custom={1.0} initial="hidden" animate="visible" />
              <motion.circle cx="75" cy="25" r="4" fill="#7C3AED" variants={nodeVariants} custom={1.1} initial="hidden" animate="visible" />
              <motion.circle cx="75" cy="75" r="4" fill="#7C3AED" variants={nodeVariants} custom={1.2} initial="hidden" animate="visible" />
            </svg>

            {/* Glowing assembled pulse indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.4, 0] }}
              transition={{ delay: 1.4, duration: 0.6, repeat: 0 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-brand-accent filter blur-xl"
            />

            {/* Wordmark */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4, type: 'spring' }}
              className="font-sans text-3xl font-extrabold tracking-tight text-white"
            >
              Dev<span className="text-brand-accent">Mesh</span>
            </motion.h1>

            {/* Sub-label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.7, duration: 0.4 }}
              className="mt-2 text-xs font-mono tracking-widest uppercase text-slate-400"
            >
              Establishing connection...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
