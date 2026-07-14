import React from 'react';
import { FolderPlus, MessageSquareCode, BellRing, Trophy, Award, Inbox, HardDrive } from 'lucide-react';

const EmptyState = ({ type, title, message, actionText, onActionClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'projects':
        return <FolderPlus className="w-12 h-12 text-brand-primary" />;
      case 'messages':
        return <MessageSquareCode className="w-12 h-12 text-brand-accent" />;
      case 'notifications':
        return <BellRing className="w-12 h-12 text-brand-accent" />;
      case 'leaderboard':
        return <Trophy className="w-12 h-12 text-yellow-500 animate-bounce-slow" />;
      case 'reviews':
        return <Award className="w-12 h-12 text-amber-500" />;
      case 'files':
        return <HardDrive className="w-12 h-12 text-brand-primary" />;
      default:
        return <Inbox className="w-12 h-12 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm max-w-lg mx-auto py-12 relative overflow-hidden group">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl mb-4 relative z-10 shadow-sm">
        {getIcon()}
      </div>

      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 relative z-10">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-6 relative z-10">
        {message}
      </p>

      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="relative z-10 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent rounded-xl hover:opacity-90 shadow-md hover:scale-[1.02] transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
