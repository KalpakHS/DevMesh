import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Inbox,
  Award,
  ChevronRight,
  BookOpen,
  Activity,
  AlertCircle,
  TrendingUp,
  Video,
  FileText
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor/dashboard');
      if (res.data.status === 'success') {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load mentor dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchDashboardData();
    };
    socket.on('notification_received', handleRefresh);
    socket.on('reputation_updated', handleRefresh);
    return () => {
      socket.off('notification_received', handleRefresh);
      socket.off('reputation_updated', handleRefresh);
    };
  }, [socket]);

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Synchronizing Academic Mentor Dashboard...
        </div>
      </Layout>
    );
  }

  const stats = data?.stats || { projectsAssigned: 0, activeProjects: 0, pendingReviews: 0, meetingsThisWeek: 0, repEarned: 0 };
  const requests = data?.requests || [];
  const upcomingMeetings = data?.upcomingMeetings || [];
  const notifications = data?.notifications || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-955 p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Academic Control Hub
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200 mt-1.5">
              Mentor Dashboard
            </h2>
            <p className="text-xs text-slate-550 max-w-lg">
              Analyze project telemetry logs, resolve milestones, and schedule huddle meeting timelines.
            </p>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/mentor/requests')}
            className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:border-brand-primary/40 shadow-sm transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-extrabold text-sm text-slate-800">View Requests</span>
                <span className="block text-[10px] text-slate-450">Review incoming requests ({requests.length})</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigate('/mentor/reviews')}
            className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:border-brand-primary/40 shadow-sm transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-extrabold text-sm text-slate-800">Review Milestones</span>
                <span className="block text-[10px] text-slate-450">Evaluate submitted student milestones</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigate('/mentor/meetings')}
            className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:border-brand-primary/40 shadow-sm transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-red-50 text-red-650">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-extrabold text-sm text-slate-800">Schedule Meeting</span>
                <span className="block text-[10px] text-slate-455">Initiate Google Meet sessions</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Application Status Navigation Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Applications', count: stats.pendingApplications || 0, color: 'border-amber-250 bg-amber-50/10 text-amber-600' },
            { label: 'Accepted Applications', count: stats.acceptedApplications || 0, color: 'border-emerald-250 bg-emerald-50/10 text-emerald-600' },
            { label: 'Rejected Applications', count: stats.rejectedApplications || 0, color: 'border-red-250 bg-red-50/10 text-red-600' },
            { label: 'Active Mentoring Projects', count: stats.activeProjects || 0, color: 'border-indigo-250 bg-indigo-50/10 text-indigo-600' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate('/mentor/applications')}
              className={`p-5 border rounded-2xl shadow-sm hover:opacity-90 transition-all text-left flex justify-between items-center ${item.color}`}
            >
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">{item.label}</span>
                <span className="block text-2xl font-black mt-1">{item.count}</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-60" />
            </button>
          ))}
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Projects Assigned', val: stats.projectsAssigned, color: 'text-brand-primary' },
            { label: 'Active Projects', val: stats.activeProjects, color: 'text-indigo-500' },
            { label: 'Pending Reviews', val: stats.pendingReviews, color: 'text-amber-500' },
            { label: 'Meetings This Week', val: stats.meetingsThisWeek, color: 'text-red-500' },
            { label: 'REP Earned through Mentoring', val: `${stats.repEarned} PTS`, color: 'text-emerald-500' }
          ].map((stat, idx) => (
            <div key={idx} className="rounded-3xl border bg-white p-5 shadow-sm space-y-1">
              <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">{stat.label}</span>
              <span className={`block text-xl font-black ${stat.color}`}>{stat.val}</span>
            </div>
          ))}
        </div>

        {/* Charts & Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Charts widget column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Analytics Charts block */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-base flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Performance Graphs</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Chart 1: Weekly Review Activity */}
                <div className="space-y-3">
                  <span className="block font-bold text-slate-400 text-[10px] uppercase">Weekly Review Activity</span>
                  <div className="h-28 flex items-end justify-between px-2 pt-4 border-b border-l border-slate-100">
                    <div className="w-4 bg-brand-primary rounded-t" style={{ height: '40%' }} />
                    <div className="w-4 bg-brand-primary rounded-t" style={{ height: '70%' }} />
                    <div className="w-4 bg-brand-primary rounded-t" style={{ height: '20%' }} />
                    <div className="w-4 bg-brand-primary rounded-t" style={{ height: '90%' }} />
                    <div className="w-4 bg-brand-primary rounded-t" style={{ height: '50%' }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                  </div>
                </div>

                {/* Chart 2: Student Progress Overview */}
                <div className="space-y-3">
                  <span className="block font-bold text-slate-400 text-[10px] uppercase">Student Progress Overview</span>
                  <div className="space-y-2 pt-2">
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span>Milestones Approved</span>
                        <span className="font-bold">75%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span>Resubmissions Pending</span>
                        <span className="font-bold">25%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '25%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 3: Project Completion Status */}
                <div className="space-y-3">
                  <span className="block font-bold text-slate-400 text-[10px] uppercase">Project Completion Status</span>
                  <div className="h-28 flex items-center justify-center">
                    {/* SVG Circular Ring Chart */}
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-indigo-500" strokeDasharray="65, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
                        65%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent activity timeline widget */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <Activity className="w-5 h-5 mr-2 text-slate-400" />
                <span>Recent Activity</span>
              </h3>

              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No workspace logs recorded.</div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((log) => (
                    <div key={log._id} className="flex items-start space-x-3 text-[11px] text-left">
                      <img src={log.actorId?.avatar || 'https://via.placeholder.com/150'} alt="Actor" className="w-7 h-7 rounded-full object-cover border" />
                      <div className="flex-1">
                        <div>
                          <span className="font-bold text-slate-800">{log.actorId?.name}</span>
                          <span className="text-slate-550 ml-1">{log.action}</span>
                        </div>
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{log.projectId?.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar column: Meetings & notifications summary */}
          <div className="space-y-6">
            {/* Upcoming meetings list */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4 text-left">
              <h3 className="font-bold text-base flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-500" />
                <span>Upcoming Meetings</span>
              </h3>

              {upcomingMeetings.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No meetings scheduled.</div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meet) => (
                    <div key={meet._id} className="p-3 border rounded-2xl bg-slate-50/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{meet.title}</span>
                        <span className="text-[10px] text-brand-primary font-bold">{new Date(meet.dateTime).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-550">{meet.projectId?.title}</p>
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-400 font-mono">{new Date(meet.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {meet.meetLink && (
                          <a href={meet.meetLink} target="_blank" rel="noreferrer" className="text-brand-primary font-bold hover:underline">
                            Join Meet
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications widget */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4 text-left">
              <h3 className="font-bold text-base flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-indigo-505" />
                <span>Notifications Summary</span>
              </h3>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No alerts logged.</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((noti) => (
                    <div key={noti._id} className="p-3 border rounded-xl bg-slate-50/20">
                      <span className="block font-bold">{noti.title}</span>
                      <span className="block text-[10px] text-slate-550 mt-0.5">{noti.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MentorDashboard;
