import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0B0F19] text-white border-t border-slate-900 overflow-hidden pt-20 pb-10">
      {/* Thin blue gradient line at the top of the footer */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

      {/* Subtle animated mesh/grid pattern behind the footer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.035)_1px,transparent_1px)] bg-[size:36px_36px] opacity-70 pointer-events-none" />

      {/* Drifting Background Nodes behind footer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-2.5 h-2.5 rounded-full bg-blue-500 animate-drift"></div>
        <div className="absolute top-[70%] left-[80%] w-2.5 h-2.5 rounded-full bg-indigo-500 animate-drift" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-slate-900/60">
          {/* Left Column: Product Links */}
          <div className="flex flex-col space-y-4">
            <span className="font-mono text-xs tracking-widest text-slate-500 uppercase">Product navigation</span>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
              <Link to="/marketplace" className="hover:text-brand-accent transition-colors">Marketplace</Link>
              <Link to="/leaderboard" className="hover:text-brand-accent transition-colors">Leaderboard</Link>
              <Link to="/dashboard" className="hover:text-brand-accent transition-colors">Workspace</Link>
              <Link to="/docs" className="hover:text-brand-accent transition-colors">Documentation</Link>
            </div>
          </div>

          {/* Center Column: Social Proof */}
          <div className="flex flex-col space-y-4">
            <span className="font-mono text-xs tracking-widest text-slate-500 uppercase">Platform statistics</span>
            <p className="text-sm text-slate-400">
              Trusted by <span className="text-white font-semibold">2,000+ developers</span> worldwide.
            </p>
            <a href="#" className="text-xs font-semibold text-brand-primary dark:text-brand-accent hover:underline inline-block group">
              See Success Stories
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
            </a>
          </div>

          {/* Right Column: Server status */}
          <div className="flex flex-col space-y-4 md:items-end">
            <span className="font-mono text-xs tracking-widest text-slate-500 uppercase md:text-right">System status</span>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-emerald-400 font-medium">All systems operational</span>
            </div>
            <p className="text-xs text-slate-500 md:text-right">
              Built with MERN Stack · Version 1.0
            </p>
          </div>
        </div>

        {/* Center Hero Branding: Large signature watermark with radial glow */}
        <div className="py-12 select-none relative flex justify-center items-center overflow-hidden">
          {/* Soft blue glow behind the watermark */}
          <div className="absolute w-[250px] h-[60px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center font-sans font-extrabold text-[8vw] md:text-[6vw] tracking-tighter bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent lowercase leading-none select-none"
            style={{ opacity: 0.10 }}
          >
            devmesh<span className="text-blue-400">.</span>
          </motion.h2>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-900/60 text-xs text-slate-500">
          <div>
            © {currentYear} DevMesh. All rights reserved.
          </div>
          <div className="md:text-center">
            Connect. Collaborate. Create.
          </div>
          <div className="md:text-right space-x-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
