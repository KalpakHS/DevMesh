import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FaqSection = () => {
  const faqs = [
    {
      q: 'How do I join a project team?',
      a: 'Browse the Project Marketplace, pick a project, review the open roles needed, and click Apply. The project owner will receive your application details and can add you to the workspace in one click.'
    },
    {
      q: 'How does the Developer Reputation (REP) score work?',
      a: 'Reputation is earned by completing Kanban tasks, committing code, and receiving positive peer reviews from teammates after finishing a project workspace.'
    },
    {
      q: 'Can recruiters contact developers directly?',
      a: 'Yes! Recruiters using the Recruiter Workspace can search candidate developers by skills and reputation, review portfolios/resumes, and send direct interview invites.'
    },
    {
      q: 'Is DevMesh free for students and developers?',
      a: 'Absolutely. Sourcing, team creation, Kanban tracking, and portfolio hosting is 100% free for students and developers.'
    }
  ];

  const [openIdx, setOpenIdx] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-slate-50 dark:bg-brand-dark border-t border-slate-150 dark:border-slate-900 text-left relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-455">
            Everything you need to know about team collaboration and profiles on DevMesh.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2, scale: 1.005, borderColor: "rgba(37,99,235,0.2)" }}
                transition={{ duration: 0.2 }}
                className="bg-[#F8FAFC]/90 dark:bg-slate-900/60 border border-blue-500/8 dark:border-slate-800/80 rounded-[18px] overflow-hidden transition-all duration-300 shadow-[0_10px_20px_rgba(15,23,42,0.03)]"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className={isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
