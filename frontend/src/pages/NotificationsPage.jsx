import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  Trash2,
  AlertCircle,
  FolderDot,
  CheckSquare,
  Users,
  GraduationCap,
  Briefcase,
  HelpCircle,
  Inbox
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, projects, tasks, workspace, mentor, recruiter, system
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.status === 'success') {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time socket updates for new notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('notification_received', (noti) => {
      setNotifications((prev) => [noti, ...prev]);
    });

    return () => {
      socket.off('notification_received');
    };
  }, [socket]);

  const handleMarkAsRead = async (notiId) => {
    try {
      const res = await api.put(`/notifications/${notiId}/read`);
      if (res.data.status === 'success') {
        setNotifications(prev =>
          prev.map((n) => (n._id === notiId ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      // Local fallback
      setNotifications(prev =>
        prev.map((n) => (n._id === notiId ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.status === 'success') {
        setNotifications(prev => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      setNotifications(prev => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDeleteNotification = async (notiId) => {
    try {
      const res = await api.delete(`/notifications/${notiId}`);
      if (res.data.status === 'success') {
        setNotifications(prev => prev.filter((n) => n._id !== notiId));
      }
    } catch (err) {
      setNotifications(prev => prev.filter((n) => n._id !== notiId));
    }
  };

  // Helper to categorize notifications on client-side
  const getCategory = (noti) => {
    const text = (noti.title + ' ' + noti.message).toLowerCase();
    if (text.includes('task') || text.includes('assign')) return 'tasks';
    if (text.includes('workspace') || text.includes('announcement') || text.includes('note') || text.includes('file')) return 'workspace';
    if (text.includes('project') || text.includes('application') || text.includes('collab')) return 'projects';
    if (text.includes('mentor') || text.includes('review')) return 'mentor';
    if (text.includes('invite') || text.includes('interview') || text.includes('recruiter')) return 'recruiter';
    return 'system';
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return getCategory(n) === filter;
  });

  const getCategoryIcon = (cat) => {
    const map = {
      tasks: <CheckSquare className="w-4 h-4 text-emerald-500" />,
      workspace: <FolderDot className="w-4 h-4 text-blue-500" />,
      projects: <Users className="w-4 h-4 text-indigo-500" />,
      mentor: <GraduationCap className="w-4 h-4 text-purple-500" />,
      recruiter: <Briefcase className="w-4 h-4 text-amber-500" />,
      system: <Bell className="w-4 h-4 text-slate-400" />
    };
    return map[cat] || <HelpCircle className="w-4 h-4 text-slate-400" />;
  };

  return (
    <Layout>
      <div className="space-y-8 text-left max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Notifications Log</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage system updates, task status modifications, and review checklists.
            </p>
          </div>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-1.5 bg-brand-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow hover:opacity-90 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-900">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'projects', label: 'Project' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'workspace', label: 'Workspace' },
            { id: 'mentor', label: 'Mentor' },
            { id: 'recruiter', label: 'Recruiter' },
            { id: 'system', label: 'System' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === tab.id
                  ? 'bg-slate-900 dark:bg-slate-800 text-white border-transparent'
                  : 'bg-white dark:bg-slate-955 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono animate-pulse">
            Syncing real-time notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-350 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
            <Inbox className="w-8 h-8 text-slate-400" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm">No Notifications</h3>
              <p className="text-xs text-slate-500">
                You do not have any notification alerts in this category.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((noti) => {
                const cat = getCategory(noti);
                return (
                  <motion.div
                    key={noti._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-2xl border p-4 shadow-sm flex items-start justify-between gap-4 transition-all ${
                      noti.isRead
                        ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 opacity-80'
                        : 'bg-brand-primary/5 dark:bg-brand-primary/5 border-brand-primary/25'
                    }`}
                  >
                    <div className="flex items-start space-x-3 text-xs md:w-4/5 text-left">
                      <div className="p-2.5 bg-slate-55 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-850/50 flex-shrink-0">
                        {getCategoryIcon(cat)}
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-800 dark:text-slate-250">
                          {noti.title}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {noti.message}
                        </p>
                        <span className="block text-[10px] text-slate-400">
                          {new Date(noti.createdAt).toLocaleDateString()} at {new Date(noti.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!noti.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(noti._id)}
                          className="px-2.5 py-1.5 bg-brand-primary/10 hover:bg-brand-primary hover:text-white border border-brand-primary/20 text-brand-primary rounded-lg text-[10px] font-bold transition-all"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(noti._id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
