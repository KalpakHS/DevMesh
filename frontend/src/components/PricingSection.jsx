import React, { useState } from 'react';
import { Check, CheckCircle2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState('Developer Sandbox');
  const [showModal, setShowModal] = useState(false);
  const [modalPlan, setModalPlan] = useState(null);

  const plans = [
    {
      name: 'Developer Sandbox',
      price: '$0',
      period: 'forever',
      desc: 'Publish profiles, showcase repositories, and discover active student project teams.',
      features: ['Up to 3 active teams', 'Personal portfolio page', 'Public group workspace chat', 'Standard badge awards'],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro Collaborator',
      price: '$9',
      period: 'per month',
      desc: 'Form infinite workspaces, unlock premium AI recommendations, and coordinate audio calls.',
      features: ['Unlimited team creation', 'Priority AI talent suggestion', 'Live video meeting channels', 'Custom profile portfolios', 'Advanced weekly velocity analytics'],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Recruiter Hub',
      price: '$49',
      period: 'per month',
      desc: 'Comprehensive search dashboards, automated resume downloads, and interview tools.',
      features: ['Candidate developer search', 'Filter by skills & reputation', 'Send interview invitations', 'CSV candidate bookmark export', 'Hiring analytics & graphs'],
      cta: 'Start Recruiter Trial',
      popular: false,
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.name);
    setModalPlan(plan);
    setShowModal(true);
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-150 dark:border-slate-900 text-left relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white">
            Choose Your DevMesh Plan
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Whether building portfolio proof-of-concepts or looking to source technical hires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const isSelected = selectedPlan === plan.name;
            let cardBgClass = '';
            
            if (idx === 0) {
              cardBgClass = isSelected
                ? 'bg-slate-50/90 dark:bg-slate-900/80 border-emerald-500/40 dark:border-emerald-500/40 shadow-[0_10px_30px_rgba(16,185,129,0.05)]'
                : 'bg-[#F1F5F9]/80 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/60 shadow-[0_10px_20px_rgba(15,23,42,0.03)]';
            } else if (idx === 1) {
              cardBgClass = isSelected
                ? 'bg-gradient-to-b from-blue-50/70 to-indigo-50/60 dark:from-slate-900 dark:to-[#0F172A] border-emerald-500/50 dark:border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.12)] border-t-[3.5px] border-t-blue-500'
                : 'bg-gradient-to-b from-blue-50/70 to-indigo-50/60 dark:from-slate-900 dark:to-[#0F172A] border-blue-500/35 dark:border-blue-500/45 shadow-[0_0_22px_rgba(59,130,246,0.15)] border-t-[3.5px] border-t-blue-500';
            } else {
              cardBgClass = isSelected
                ? 'bg-[#F8FAFC]/90 dark:bg-slate-900/80 border-emerald-500/40 dark:border-emerald-500/40 shadow-[0_10px_30px_rgba(16,185,129,0.05)] border-l-[3.5px] border-l-blue-500'
                : 'bg-[#F8FAFC]/90 dark:bg-slate-900/80 border-blue-500/8 dark:border-slate-800/85 shadow-[0_10px_30px_rgba(15,23,42,0.06)] border-l-[3.5px] border-l-blue-500';
            }

            return (
              <motion.div
                key={idx}
                whileHover={{ 
                  y: -6, 
                  scale: 1.015,
                  boxShadow: isSelected ? "0 20px 40px rgba(16,185,129,0.08)" : "0 20px 40px rgba(15,23,42,0.10)"
                }}
                transition={{ duration: 0.25 }}
                className={`rounded-[18px] p-8 border flex flex-col justify-between relative backdrop-blur-md transition-all duration-300 ${cardBgClass}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-blue-600 to-indigo-650 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{plan.name}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-extrabold font-mono text-slate-950 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ {plan.period}</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-900/60">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all mt-8 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 shadow-emerald-500/20'
                      : plan.popular
                        ? 'bg-brand-primary text-white hover:opacity-90 shadow-md'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  {isSelected ? 'Current Plan ✓' : plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PLAN SELECT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showModal && modalPlan && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Success Badge */}
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>

              {/* Header */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Plan Activated!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                You have successfully subscribed to the <span className="font-bold text-blue-500">{modalPlan.name}</span>.
              </p>

              {/* Plan Specs Overview */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 text-left space-y-3.5 mb-6">
                <div className="flex justify-between items-center text-xs font-mono border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 uppercase">Recurring Billing</span>
                  <span className="font-bold text-slate-850 dark:text-white">
                    {modalPlan.price} <span className="text-[10px] text-slate-400 font-normal">/ {modalPlan.period}</span>
                  </span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Unlocked Benefits</span>
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-350">
                    {modalPlan.features.slice(0, 3).map((feat, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Action */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-3 rounded-2xl text-xs hover:opacity-90 shadow-md transition-opacity"
              >
                Go to Workspace Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PricingSection;
