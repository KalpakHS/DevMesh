import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, CheckCircle } from 'lucide-react';

const CollaborationShowcase = () => {
  const [messages, setMessages] = useState([
    { sender: 'Priya', text: 'Hey team, I uploaded the Figma mockups for the landing page!', time: '10:30 AM' },
    { sender: 'Arjun', text: 'Awesome Priya! Let me take a look.', time: '10:31 AM' },
  ]);

  const [activeTaskIndex, setActiveTaskIndex] = useState(0); // 0 = Todo, 1 = In Progress, 2 = Done
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Loop animation cycles
    const interval = setInterval(() => {
      // Phase 1: Typing indicator appears
      setTyping(true);

      setTimeout(() => {
        // Phase 2: Typing finishes, new message enters
        setTyping(false);
        setMessages((prev) => {
          if (prev.length >= 4) {
            return [
              { sender: 'Priya', text: 'Hey team, I uploaded the Figma mockups for the landing page!', time: '10:30 AM' },
              { sender: 'Arjun', text: 'Awesome Priya! Let me take a look.', time: '10:31 AM' },
            ];
          }
          return [
            ...prev,
            { sender: 'Sneha', text: 'Just finished moving the API auth controllers to Done! 🎉', time: '10:32 AM' },
          ];
        });

        // Phase 3: Shift Kanban task
        setActiveTaskIndex((prev) => (prev + 1) % 3);
      }, 3000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#0B0F19] py-24 text-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[30%] left-[5%] w-2 h-2 bg-brand-primary rounded-full animate-drift" />
        <div className="absolute top-[80%] left-[85%] w-2.5 h-2.5 bg-brand-accent rounded-full animate-drift" style={{ animationDelay: '2.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Real teams. Real-time.
          </h2>
          <p className="text-slate-400">
            Powered by Socket.IO for sub-100ms synchronization across message flows and Kanban task allocations.
          </p>
        </div>

        {/* Mock workspace UI container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Left panel: Real-time chat panel */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between min-h-[360px] relative shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs tracking-wider uppercase text-slate-400">Team Chat: Landing-v1</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Chat message panel */}
            <div className="flex-1 flex flex-col justify-end space-y-4 mb-4 font-sans text-sm">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col space-y-1 items-start"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-300 text-xs">{msg.sender}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                    </div>
                    <div className="bg-slate-900 text-slate-100 border border-slate-800/80 px-4 py-2.5 rounded-2xl rounded-tl-none max-w-[85%]">
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono pl-1">
                  <span>Sneha is typing</span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </span>
                </div>
              )}
            </div>

            {/* Message input mock */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
              <input
                type="text"
                disabled
                placeholder="Type message here..."
                className="flex-1 bg-transparent border-none text-xs text-slate-400 px-2 focus:outline-none"
              />
              <button disabled className="p-1.5 rounded-lg bg-brand-primary text-white">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right panel: Kanban Task list */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col shadow-xl min-h-[360px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-6">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs tracking-wider uppercase text-slate-400">Workspace Board</span>
              </div>
              <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                Linear style sync
              </span>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-3 gap-3 flex-1 items-start text-xs font-mono">
              {/* Todo Column */}
              <div className="bg-slate-900/40 border border-slate-900/80 rounded-xl p-3 flex flex-col space-y-3">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] pb-1.5 border-b border-slate-900">
                  Todo
                </span>
                {activeTaskIndex === 0 && (
                  <motion.div
                    layoutId="kanbanTask"
                    className="p-3 bg-slate-900 border border-slate-800 rounded-lg shadow cursor-pointer text-left"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[8px]">
                        API
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-200 font-medium">Setup Auth Routing</p>
                  </motion.div>
                )}
              </div>

              {/* In Progress Column */}
              <div className="bg-slate-900/40 border border-slate-900/80 rounded-xl p-3 flex flex-col space-y-3">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] pb-1.5 border-b border-slate-900">
                  In Progress
                </span>
                {activeTaskIndex === 1 && (
                  <motion.div
                    layoutId="kanbanTask"
                    className="p-3 bg-slate-900 border border-slate-800 rounded-lg shadow cursor-pointer text-left"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[8px]">
                        API
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-200 font-medium">Setup Auth Routing</p>
                  </motion.div>
                )}
              </div>

              {/* Done Column */}
              <div className="bg-slate-900/40 border border-slate-900/80 rounded-xl p-3 flex flex-col space-y-3">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] pb-1.5 border-b border-slate-900">
                  Done
                </span>
                {activeTaskIndex === 2 && (
                  <motion.div
                    layoutId="kanbanTask"
                    className="p-3 bg-slate-900 border border-emerald-500/20 bg-emerald-950/10 rounded-lg shadow cursor-pointer text-left"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px]">
                        Complete
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-200 font-medium">Setup Auth Routing</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborationShowcase;
