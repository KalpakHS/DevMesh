import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const LeaderboardPage = () => {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8 text-left max-w-4xl mx-auto"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compare reputation scores and project contributions across the ecosystem.
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-bold text-base">Leaderboard Reset</h3>
            <p className="text-xs text-slate-500">
              The metrics calculations have been cleared. Ready to start building.
            </p>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default LeaderboardPage;
