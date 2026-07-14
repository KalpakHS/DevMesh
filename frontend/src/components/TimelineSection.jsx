import React from 'react';
import { motion } from 'framer-motion';

const TimelineSection = () => {
  const steps = [
    {
      step: '01',
      title: 'Discover',
      description: 'Search open listings and locate teammates based on their skills, location, and developer reputation score.',
      rotation: 1,
    },
    {
      step: '02',
      title: 'Apply',
      description: 'Submit applications for defined project positions, or publish your own project and specify target roles.',
      rotation: -1,
    },
    {
      step: '03',
      title: 'Collaborate',
      description: 'Form workspaces dynamically, assign Kanban tickets, exchange files, and message in real time.',
      rotation: 2,
    },
    {
      step: '04',
      title: 'Ship',
      description: 'Mark project deliverables as complete, earn user reputation points, and unlock gamification badges.',
      rotation: -1.5,
    },
  ];

  return (
    <section className="bg-brand-light dark:bg-brand-dark py-24 text-slate-800 dark:text-slate-100 relative overflow-hidden">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20 flex flex-col items-center">
          <span className="bg-brand-accent/15 border border-brand-accent/25 px-3 py-1 rounded-full text-xs font-semibold text-brand-accent uppercase tracking-wider mb-4">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            From idea to shipped project, together.
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            A structured workflow tailored to support collaboration. Follow these key steps to get started.
          </p>
        </div>

        {/* Timeline Grid layout */}
        <div className="relative max-w-4xl mx-auto flex flex-col space-y-12">
          {/* Central Connecting Vertical Line for desktop (glowing animated timeline) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 bg-slate-200 dark:bg-slate-800/80 rounded-full hidden md:block overflow-hidden">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
              className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.85)]"
            />
          </div>

          {/* Steps */}
          {steps.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div
                key={item.step}
                className={`flex flex-col md:flex-row items-center w-full relative ${
                  isLeft ? 'md:justify-start' : 'md:justify-end'
                }`}
              >
                {/* Numbered step inside a glowing blue circular badge with subtle hover glow */}
                <motion.div
                  whileHover={{ scale: 1.12, boxShadow: "0 0 16px rgba(59, 130, 246, 0.75)" }}
                  className="absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-blue-600 border-4 border-white dark:border-[#07111F] text-white flex items-center justify-center font-mono font-bold text-xs shadow-[0_0_12px_rgba(59,130,246,0.6)] hidden md:flex z-10 cursor-pointer"
                >
                  {item.step}
                </motion.div>

                {/* Card Container */}
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  whileHover={{ 
                    y: -6, 
                    scale: 1.015,
                    boxShadow: "0 20px 40px rgba(15,23,42,0.10)", 
                    borderColor: "rgba(37,99,235,0.22)" 
                  }}
                  transition={{ duration: 0.25 }}
                  style={{ rotate: item.rotation }}
                  className={`w-full md:w-[45%] bg-[#F8FAFC]/90 dark:bg-slate-900/90 border border-blue-500/8 dark:border-slate-800/80 rounded-[18px] p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md transition-all duration-300 relative ${
                    idx === 0 || idx === 2 ? 'border-t-[3.5px] border-t-blue-500/80' : ''
                  }`}
                >
                  {/* Badge Hole Punch Detail */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-light dark:bg-brand-dark border border-slate-200 dark:border-slate-900 shadow-inner" />

                  {/* Step Info */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <span className="font-mono text-2xl font-extrabold italic text-brand-accent/40">{item.step}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Hand written style note */}
        <div className="text-center mt-20">
          <p className="font-serif italic text-lg text-slate-500 dark:text-slate-400 transform -rotate-1">
            Your next project starts here.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
