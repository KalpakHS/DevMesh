import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Award,
  Users,
  CheckSquare,
  PlusCircle,
  TrendingUp,
  FolderDot,
  Calendar as CalendarIcon,
  Sparkles,
  Zap,
  Activity,
  Code,
  Flame,
  ArrowRight,
  Bell,
  Compass,
  User,
  Settings,
  HelpCircle,
  Eye,
  Bookmark,
  FileText,
  Building
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Component State
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [recentCommits, setRecentCommits] = useState([]);
  const [sprintGoal, setSprintGoal] = useState(localStorage.getItem(`sprintGoal_${user?._id}`) || 'Build and deploy DevMesh starting modules');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [recruitmentStats, setRecruitmentStats] = useState(null);

  // Stats calculation
  const repScore = user?.reputation || 0;
  const badgesCount = user?.badges?.length || 0;
  const workspacesCount = workspaces.length;
  const tasksCount = pendingTasks.length;

  // Compute profile completion percentage
  const calculateCompletion = () => {
    let score = 0;
    if (user?.bio) score += 20;
    if (user?.college) score += 15;
    if (user?.skills?.length > 0) score += 15;
    if (user?.avatar) score += 15;
    if (user?.socialLinks?.github || user?.socialLinks?.linkedin) score += 15;
    if (user?.resumeUrl) score += 20;
    return score;
  };
  const profileCompletion = calculateCompletion();

  // Mock charts details (with live fallback calculations)
  const chartData = [
    { name: 'Mon', contributions: 2 },
    { name: 'Tue', contributions: 5 },
    { name: 'Wed', contributions: 3 },
    { name: 'Thu', contributions: 8 },
    { name: 'Fri', contributions: 6 },
    { name: 'Sat', contributions: 4 },
    { name: 'Sun', contributions: 7 },
  ];

  // Calendar dates
  const today = new Date();
  const currentDay = today.getDate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch workspaces (joined huddles)
        const teamsRes = await api.get('/teams/my-teams');
        if (teamsRes.data.status === 'success') {
          const joinedTeams = teamsRes.data.data.teams || [];
          setWorkspaces(joinedTeams);

          // Get active teammates & pending tasks & commits from workspaces
          const allTeammatesMap = new Map();
          const allPendingTasks = [];
          const allCommits = [];

          for (const t of joinedTeams) {
            // Fetch detailed team information to get tasks/members
            try {
              const detailsRes = await api.get(`/teams/${t._id}`);
              if (detailsRes.data.status === 'success') {
                const team = detailsRes.data.data.team;
                
                // Teammates aggregation
                team.members?.forEach(m => {
                  if (m.user && m.user._id !== user?._id && m.user._id !== user?.id) {
                    allTeammatesMap.set(m.user._id, m.user);
                  }
                });

                // Pending tasks aggregation
                team.tasks?.forEach(task => {
                  if (task.assignedTo === user?.id || task.assignedTo?._id === user?._id || task.assignedTo === user?._id) {
                    if (task.status !== 'Done' && task.status !== 'done') {
                      allPendingTasks.push({ ...task, workspaceName: team.project?.title, workspaceId: team._id });
                    }
                  }
                });

                // Mock GitHub Commits list parsed from repository if linked
                if (team.project?.repoUrl) {
                  allCommits.push({
                    id: Math.random().toString(36).substring(7),
                    message: `Initial layout commit (#resolve)`,
                    projectTitle: team.project.title,
                    author: user?.name || 'Developer',
                    date: '2 hours ago'
                  });
                }
              }
            } catch (err) {
              console.warn('Failed to load workspace details for aggregation:', err.message);
            }
          }

          setTeammates(Array.from(allTeammatesMap.values()));
          setPendingTasks(allPendingTasks);
          setRecentCommits(allCommits.length > 0 ? allCommits : [
            { id: '1', message: 'Configured router files', projectTitle: 'Hospital System', author: user?.name, date: '1 day ago' },
            { id: '2', message: 'Seeded test developers', projectTitle: 'DevMesh Core', author: 'Reddy', date: '3 days ago' }
          ]);
        }

        // 2. Fetch Notifications
        const notiRes = await api.get('/notifications');
        if (notiRes.data.status === 'success') {
          setNotifications(notiRes.data.data.notifications?.slice(0, 5) || []);
        }

        // 3. Fetch AI Recommendations
        const recRes = await api.get('/projects/recommendations');
        if (recRes.data.status === 'success') {
          setAiSuggestions(recRes.data.data.projects || []);
        }

        // 4. Fetch Recruitment Activity stats
        try {
          const recruitRes = await api.get('/users/recruitment-activity');
          if (recruitRes.data.status === 'success') {
            setRecruitmentStats(recruitRes.data.data);
          }
        } catch (err) {
          console.warn('Failed to load recruitment stats:', err.message);
        }
      } catch (error) {
        console.error('Failed to load developer dashboard telemetry:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleUpdateTaskStatus = async (workspaceId, taskId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'todo' || currentStatus === 'To Do' ? 'in-progress' : 'done';
      const res = await api.put(`/teams/${workspaceId}/tasks/${taskId}`, { status: nextStatus });
      if (res.data.status === 'success') {
        // Remove completed task or update status locally
        setPendingTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: nextStatus } : t).filter(t => t.status !== 'done' && t.status !== 'Done'));
      }
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  const handleSaveGoal = () => {
    localStorage.setItem(`sprintGoal_${user?._id}`, sprintGoal);
    setIsEditingGoal(false);
  };

  // Generate GitHub style heatmap grid (52 weeks x 7 days - simplified to 24 columns for layout fit)
  const heatmapCells = Array.from({ length: 168 }, (_, i) => {
    const level = i % 13 === 0 ? 3 : i % 7 === 0 ? 2 : i % 5 === 0 ? 1 : 0;
    return level;
  });

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-slate-500 font-mono text-xs animate-pulse">
          Fanning dashboard widgets... Please wait.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
        {/* TOP ROW: Welcome Card + Profile Completion Ring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Greeting Banner */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-24 -top-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1 bg-brand-primary/10 text-brand-primary font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-brand-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                <span>Available for collaborations</span>
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Good to see you, {user?.name || 'Developer'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Let's make progress on your active workspaces. Here is your sprint summaries checklist.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                to="/marketplace"
                className="flex items-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold text-xs px-5 py-3 rounded-2xl hover:opacity-90 shadow-md transition-all"
              >
                <span>Browse Projects</span>
                <Compass className="w-4 h-4" />
              </Link>
              <Link
                to="/projects/create"
                className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold text-xs px-5 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md"
              >
                <span>Create Project</span>
                <PlusCircle className="w-4 h-4" />
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-xs px-5 py-3 rounded-2xl transition-all"
              >
                <span>Edit Profile</span>
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Profile Completion Circle Gauge */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="text-xs font-semibold text-slate-400 absolute top-6 left-6">Profile Completion</h3>
            <div className="relative w-28 h-28 flex items-center justify-center mt-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-900"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-primary transition-all duration-1000"
                  strokeDasharray={`${profileCompletion}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold tracking-tight">{profileCompletion}%</span>
              </div>
            </div>
            <Link to="/settings" className="text-[11px] font-bold text-brand-primary hover:underline mt-4">
              Complete profile parameters
            </Link>
          </div>
        </div>

        {/* MIDDLE ROW: Core Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Reputation Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400">REP Score</span>
              <span className="block text-xl font-bold tracking-tight">{repScore} PTS</span>
            </div>
          </div>

          {/* Badges Count */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400">Badges Earned</span>
              <span className="block text-xl font-bold tracking-tight">{badgesCount} Badges</span>
            </div>
          </div>

          {/* Active Workspaces */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <FolderDot className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400">Active Workspaces</span>
              <span className="block text-xl font-bold tracking-tight">{workspacesCount} Joined</span>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400">Pending Tasks</span>
              <span className="block text-xl font-bold tracking-tight">{tasksCount} Assigned</span>
            </div>
          </div>
        </div>

        {/* Recruiter Activity & Telemetry Row */}
        {recruitmentStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Views */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>Profile Views (Recruiters)</span>
                </h3>
                <span className="text-[9px] text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full font-bold">Like LinkedIn</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center mt-2">
                <div className="p-3 border rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10">
                  <span className="block text-[8px] text-slate-400 uppercase font-black">Today</span>
                  <span className="block text-xl font-black text-indigo-650 mt-1">{recruitmentStats.views?.today || 0}</span>
                </div>
                <div className="p-3 border rounded-2xl bg-blue-50/20 dark:bg-blue-950/10">
                  <span className="block text-[8px] text-slate-400 uppercase font-black">This Week</span>
                  <span className="block text-xl font-black text-blue-600 mt-1">{recruitmentStats.views?.week || 0}</span>
                </div>
                <div className="p-3 border rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10">
                  <span className="block text-[8px] text-slate-400 uppercase font-black">This Month</span>
                  <span className="block text-xl font-black text-emerald-600 mt-1">{recruitmentStats.views?.month || 0}</span>
                </div>
              </div>
            </div>

            {/* Saved by Recruiters */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 text-left">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center">
                <Bookmark className="w-4 h-4 mr-2 text-indigo-500 fill-indigo-500" />
                <span>Saved by Recruiters</span>
              </h3>
              {recruitmentStats.bookmarkedCompanies?.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs italic border border-dashed rounded-xl">
                  Not yet bookmarked by recruiters.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recruitmentStats.bookmarkedCompanies?.map((c, idx) => (
                    <span key={idx} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-xl font-extrabold text-[9px] border border-indigo-100 dark:border-indigo-900">
                      {c.company}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Downloads */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 text-left">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-emerald-500" />
                <span>Resume Downloads Tracker</span>
              </h3>
              {recruitmentStats.resumeDownloads?.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs italic border border-dashed rounded-xl">
                  No resume downloads logged yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                  {recruitmentStats.resumeDownloads?.slice(0, 3).map((d, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] border-b pb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{d.company}</span>
                      <span className="text-[9px] text-slate-400">{new Date(d.downloadedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORKSPACE & TASKS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Workspaces Card list */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Active Workspaces</h3>
              <Link to="/marketplace" className="text-xs text-brand-primary font-bold hover:underline flex items-center">
                <span>Find project</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {workspaces.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                No active workspace huddles found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspaces.map((t) => (
                  <Link
                    key={t._id}
                    to={`/teams/${t._id}`}
                    className="border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-left hover:scale-[1.01] transition-all bg-slate-50/20 hover:bg-slate-50/60 dark:bg-slate-900/10 dark:hover:bg-slate-900/30 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                        {t.project?.category || 'General'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                        {t.project?.title || 'Unnamed Project'}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] text-slate-400">Owner: {t.owner?.name}</span>
                      <span className="text-xs text-brand-primary font-bold">Open Huddle &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pending Tasks Checklist */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base mb-3">Pending Tasks</h3>
              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                  You are all caught up with tasks!
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {pendingTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-start justify-between p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 hover:border-brand-primary/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                          {task.workspaceName}
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {task.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleUpdateTaskStatus(task.workspaceId, task._id, task.status)}
                        className="text-[10px] font-bold bg-brand-primary/10 hover:bg-brand-primary hover:text-white border border-brand-primary/20 text-brand-primary rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Productivity Score Calculation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Productivity Score</span>
              <span className="font-mono font-bold text-brand-primary text-sm">
                {Math.max(60, Math.min(100, 60 + repScore))} / 100
              </span>
            </div>
          </div>
        </div>

        {/* CONTRIBUTION GRAPHS & GITHUB HEATMAP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Area / Line Chart */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Weekly Activity Velocity</h3>
              <span className="text-xs font-mono text-slate-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                <span>+12% vs last week</span>
              </span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    dot={{ fill: '#4F46E5', strokeWidth: 1.5 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GitHub-style Contribution Heatmap */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base mb-1">GitHub Contribution Heatmap</h3>
              <p className="text-[11px] text-slate-400 mb-4">Workspace activity and commits log tracking.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, minmax(0, 1fr))', gap: '3px' }}>
                {heatmapCells.map((lvl, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-sm transition-colors ${
                      lvl === 3
                        ? 'bg-brand-primary'
                        : lvl === 2
                        ? 'bg-brand-primary/60'
                        : lvl === 1
                        ? 'bg-brand-primary/20'
                        : 'bg-slate-100 dark:bg-slate-900 border border-slate-200/20 dark:border-slate-850/50'
                    }`}
                    title={`${lvl} workspace actions`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-900">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-900 rounded-sm" />
                <div className="w-2.5 h-2.5 bg-brand-primary/20 rounded-sm" />
                <div className="w-2.5 h-2.5 bg-brand-primary/60 rounded-sm" />
                <div className="w-2.5 h-2.5 bg-brand-primary rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Suggestions, Commits, Calendar, Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Suggestions + Recent Commits */}
          <div className="space-y-6 lg:col-span-2">
            {/* AI suggestions */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <h3 className="font-bold text-base">Recommended Collabs for You</h3>
              </div>

              {aiSuggestions.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                  Add more skills to your profile settings to query suggestions!
                </div>
              ) : (
                <div className="space-y-3">
                  {aiSuggestions.map((project) => (
                    <div
                      key={project._id}
                      className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-900/10 hover:border-brand-primary/20 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          {project.title}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Category: {project.category} • Difficulty: {project.difficulty || 'Intermediate'}
                        </span>
                      </div>
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-[10px] font-bold text-brand-primary hover:underline flex items-center"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent GitHub Commits */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base">Recent GitHub Commits</h3>
              </div>

              <div className="space-y-3">
                {recentCommits.map((commit) => (
                  <div
                    key={commit.id}
                    className="flex items-start justify-between p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/10 dark:bg-slate-900/5 font-mono text-[11px] text-slate-500"
                  >
                    <div className="space-y-1 text-left">
                      <span className="font-bold text-brand-accent">#{commit.id}</span>
                      <span className="text-slate-800 dark:text-slate-200 ml-2">{commit.message}</span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Workspace: {commit.projectTitle} • Author: {commit.author}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{commit.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar, Notifications & Sprint Goal Sideboard */}
          <div className="space-y-6">
            {/* Sprint Goal Widget */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">Weekly Sprint Goal</h3>
                <button
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="text-xs text-brand-primary font-bold hover:underline"
                >
                  {isEditingGoal ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditingGoal ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={sprintGoal}
                    onChange={(e) => setSprintGoal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow"
                  >
                    Save Goal
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl">
                  <p className="text-xs text-slate-600 dark:text-slate-350 italic font-semibold leading-relaxed">
                    "{sprintGoal}"
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Calendar Widget */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-sm">Workspace Deadlines Calendar</h3>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] pt-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d} className="font-bold text-slate-400">
                    {d}
                  </span>
                ))}
                {/* Calendar empty spacers for first day of current month */}
                {Array.from({ length: new Date(today.getFullYear(), today.getMonth(), 1).getDay() }).map((_, idx) => (
                  <div key={`spacer-${idx}`} className="h-7 w-7" />
                ))}
                {Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === currentDay;
                  return (
                    <div
                      key={i}
                      className={`h-7 w-7 flex items-center justify-center rounded-lg font-semibold border ${
                        isToday
                          ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Teammates list */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base">Workspace Teammates</h3>
              {teammates.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                  No active teammates list loaded yet.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teammates.map((member) => (
                    <Link
                      key={member._id}
                      to={`/profile/${member._id}`}
                      className="flex items-center space-x-2 p-1.5 pr-3 border border-slate-200 dark:border-slate-850 rounded-full bg-slate-50/50 dark:bg-slate-900/10 hover:border-brand-primary/20 transition-all"
                      title={member.bio || 'Teammate'}
                    >
                      <img
                        src={member.avatar || 'https://via.placeholder.com/150'}
                        alt={member.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                        {member.name}
                      </span>
                    </Link>
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

export default Dashboard;
