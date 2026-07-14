import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlobeVisualization from './GlobeVisualization';
import PremiumMeshBackground from './PremiumMeshBackground';

const HeroSection = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroY = useTransform(scrollY, [0, 450], [0, -80]);
  const globeScale = useTransform(scrollY, [0, 450], [1, 1.12]);

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      openAuthModal('register');
    }
  };

  const handleExplore = () => {
    navigate('/marketplace');
  };

  // Globe visualization uses its own isolated state management

  return (
    <section className="relative min-h-screen bg-white dark:bg-[#07111F] flex items-center justify-center pt-24 pb-16 overflow-hidden transition-colors duration-300">
      {/* Premium adaptive animated mesh network backdrop */}
      <PremiumMeshBackground />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 xl:gap-16 items-center relative z-10">
        {/* Left Column: Headline */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="flex flex-col space-y-8 text-left relative"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="self-start flex items-center space-x-2 bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 px-3 py-1 rounded-full text-xs font-mono text-slate-650 dark:text-slate-300"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Now in Beta — Join 2,000+ developers</span>
          </motion.div>

          {/* Heading */}
          <div className="space-y-3 relative">
            {/* Soft gradient glow behind the hero heading */}
            <div className="absolute -inset-10 bg-blue-500/8 dark:bg-blue-600/8 blur-[80px] pointer-events-none -z-10 rounded-full"></div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight"
            >
              Where developers <br />
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                build together.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed"
            >
              Discover matching collaborators, build beautiful portfolios, form cross-functional teams, and ship projects in one unified live workspace.
            </motion.p>
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap gap-4 relative"
          >
            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                  "0 0 22px rgba(59, 130, 246, 0.55)",
                  "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
                ]
              }}
              transition={{
                boxShadow: { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }}
              onClick={handleStart}
              className="flex items-center space-x-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold px-6 py-3 rounded-full transition-all shadow-md"
            >
              <span>Find Your Team</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ y: -4, scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.8)' }}
              whileTap={{ scale: 0.97 }}
              animate={{
                borderColor: [
                  "rgba(148, 163, 184, 0.3)",
                  "rgba(59, 130, 246, 0.65)",
                  "rgba(148, 163, 184, 0.3)"
                ]
              }}
              transition={{
                borderColor: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              onClick={handleExplore}
              className="px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md text-slate-700 dark:text-white font-medium transition-all"
            >
              Explore Projects
            </motion.button>

            {/* Floating Glass Card 2: Live Collaboration */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              className="absolute -bottom-20 left-4 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/70 backdrop-blur-md shadow-lg pointer-events-none z-20 hidden md:flex items-center space-x-2 select-none"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div>
                <span className="block text-[9px] font-bold text-slate-850 dark:text-white uppercase tracking-wider leading-none">Live Collaboration</span>
                <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">358 messages today</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive 3D Globe Visualization */}
        <motion.div
          style={{ scale: globeScale }}
          className="relative w-full max-w-[530px] mx-auto"
        >
          {/* Large blurred blue radial glow behind the globe */}
          <div className="absolute inset-0 bg-blue-500/12 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
          
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute -top-6 -left-8 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/70 backdrop-blur-md shadow-lg pointer-events-none z-20 hidden xl:flex items-center space-x-2 select-none"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <span className="block text-[9px] font-bold text-slate-850 dark:text-white uppercase tracking-wider leading-none">Active Teams</span>
              <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">127 teams online</span>
            </div>
          </motion.div>

          <GlobeVisualization />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center space-y-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400">Scroll</span>
          <svg width="12" height="18" viewBox="0 0 12 18" className="text-slate-800 dark:text-white">
            <rect x="1" y="1" width="10" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="6" cy="5" r="1.5" fill="currentColor" className="animate-bounce" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
