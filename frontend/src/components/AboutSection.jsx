import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Code2, Users2, Zap, BarChart2, GitCommit, Check } from 'lucide-react';

const AboutSection = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <section className="relative bg-brand-primary text-white py-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[20%] left-[80%] w-3 h-3 rounded-full bg-white animate-pulse-slow"></div>
        <div className="absolute top-[60%] left-[10%] w-2 h-2 rounded-full bg-white animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Tilted Interactive Developer Badge card */}
        <div className="flex justify-center relative select-none">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-[320px] h-[460px] relative cursor-pointer [perspective:1000px]"
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full h-full relative"
            >
              {/* FRONT OF BADGE */}
              <div 
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 rounded-3xl bg-slate-900 text-slate-100 border border-slate-800/80 p-6 shadow-2xl flex flex-col justify-between"
              >
                {/* Lanyard Clip */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-6 rounded-b-xl bg-slate-800 border-x border-b border-slate-700 flex items-center justify-center">
                  <div className="w-4 h-1.5 rounded-full bg-slate-950" />
                </div>

                {/* User Profile Info */}
                <div className="flex flex-col items-center text-center mt-4">
                  <div className="relative">
                    <img
                      src="/kalpak_3d_avatar.png"
                      alt="Kalpak 3D Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.35)]"
                    />
                    <span className="absolute bottom-0 right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center font-mono text-[9px] font-bold text-white">
                      ✓
                    </span>
                  </div>
                  
                  <h3 className="mt-4 font-bold text-xl tracking-tight text-white">KALPAK</h3>
                  <p className="font-mono text-xs text-slate-400">Full Stack Engineer</p>

                  {/* Reputation points block */}
                  <div className="mt-3 flex items-center space-x-1.5 bg-brand-accent/20 px-3 py-1 rounded-full border border-brand-accent/30">
                    <Award className="w-3.5 h-3.5 text-brand-accent" />
                    <span className="font-mono text-[10px] font-semibold text-brand-accent">240 REP</span>
                  </div>

                  {/* Skills Tags */}
                  <div className="mt-5 flex flex-wrap gap-1.5 justify-center">
                    {['React', 'Node.js', 'TypeScript', 'GraphQL', 'Next.js'].map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-slate-350"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom barcode and hint */}
                <div className="pt-4 border-t border-slate-800/85 flex flex-col items-center space-y-1.5">
                  <div className="w-full h-8 bg-slate-950 rounded flex items-center justify-center overflow-hidden opacity-85">
                    {/* Barcode representation */}
                    <div className="flex space-x-[1.5px] items-stretch h-full py-1">
                      {[3, 1, 4, 1, 2, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 1].map((w, idx) => (
                        <div
                          key={idx}
                          style={{ width: `${w}px` }}
                          className="bg-slate-300"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between w-full text-[8px] font-mono text-slate-500 uppercase tracking-widest px-1">
                    <span>DevMesh ID-77409</span>
                    <span className="text-blue-400 animate-pulse">✦ Click to Flip ✦</span>
                  </div>
                </div>
              </div>

              {/* BACK OF BADGE */}
              <div 
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 rounded-3xl bg-slate-950 text-slate-100 border border-blue-500/20 p-6 shadow-2xl flex flex-col justify-between"
              >
                {/* Lanyard Clip Back */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-6 rounded-b-xl bg-slate-800 border-x border-b border-slate-700 flex items-center justify-center">
                  <div className="w-4 h-1.5 rounded-full bg-slate-900" />
                </div>

                {/* Ledger / Metrics details */}
                <div className="flex flex-col space-y-5 mt-4">
                  <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                    <BarChart2 className="w-4 h-4 text-blue-400" />
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Project Ledger</span>
                  </div>

                  {/* Active teams */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Active Workspaces</span>
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="font-medium text-slate-200">AI Interview Platform (Owner)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="font-medium text-slate-200">Cloud Cluster (Contributor)</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Reputation Analytics</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/40 text-center">
                        <span className="block text-slate-450 text-[9px] uppercase">Commits</span>
                        <span className="font-bold text-white text-sm">1,280</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/40 text-center">
                        <span className="block text-slate-450 text-[9px] uppercase">PRs Merged</span>
                        <span className="font-bold text-white text-sm">342</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest px-1">
                  <span>Authorized Profile</span>
                  <span className="text-blue-400">✦ Click to Flip ✦</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Copy */}
        <div className="flex flex-col space-y-8 text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Built for how developers actually work.
          </h2>

          <p className="text-lg text-blue-100 leading-relaxed max-w-xl">
            DevMesh consolidates your fragmented stack. Ditch the chaotic mix of portfolio hosts, application boards, Discord chat channels, and Notion task lists. Form your team, coordinate assignments, upload assets, and exchange instant messages in one integrated workflow.
          </p>

          {/* Stats blocks */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-blue-400/30">
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">2,000+</span>
              <span className="text-xs text-blue-100 font-mono tracking-widest uppercase">Developers</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">500+</span>
              <span className="text-xs text-blue-100 font-mono tracking-widest uppercase">Projects Shipped</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">40+</span>
              <span className="text-xs text-blue-100 font-mono tracking-widest uppercase">Countries</span>
            </div>
          </div>

          {/* Tech Row logos */}
          <div className="flex items-center space-x-4 pt-2">
            <span className="text-xs font-mono text-blue-200">Credibility:</span>
            <div className="flex space-x-3 text-slate-950">
              <span className="bg-white/10 border border-white/20 px-2.5 py-1 rounded-md text-xs font-mono">React</span>
              <span className="bg-white/10 border border-white/20 px-2.5 py-1 rounded-md text-xs font-mono">Node.js</span>
              <span className="bg-white/10 border border-white/20 px-2.5 py-1 rounded-md text-xs font-mono">MongoDB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organic torn-paper SVG transition */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none transform translate-y-1">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[30px] text-white fill-current">
          <path d="M0,0 Q150,90 350,20 T700,80 T1050,40 T1200,10 L1200,120 L0,120 Z" className="text-brand-light dark:text-brand-dark fill-current" />
        </svg>
      </div>
    </section>
  );
};

export default AboutSection;
