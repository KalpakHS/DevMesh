import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Trophy,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Briefcase,
  GraduationCap,
  ClipboardList,
  FolderDot,
  X,
  Inbox,
  MessageSquare,
  Search,
  Bookmark,
  Calendar,
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const Layout = ({ children }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { liveNotifications } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ projects: [], developers: [], tasks: [], files: [] });
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults({ projects: [], developers: [], tasks: [], files: [] });
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(`/search?q=${searchQuery}`);
        if (res.data.status === 'success') {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        console.warn('Global search query failed:', err.message);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.status === 'success') {
          const unread = res.data.data.notifications.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.warn('Failed to load notifications count:', err.message);
      }
    };
    fetchUnread();
  }, [liveNotifications]);

  const menuItems = user?.role === 'Mentor' ? [
    { label: 'Dashboard', path: '/mentor', icon: LayoutDashboard },
    { label: 'Mentor Requests', path: '/mentor/requests', icon: Inbox },
    { label: 'Assigned Projects', path: '/mentor/projects', icon: Briefcase },
    { label: 'Mentor Marketplace', path: '/mentor/marketplace', icon: Compass },
    { label: 'Mentor Applications', path: '/mentor/applications', icon: ClipboardList },
    { label: 'Reviews', path: '/mentor/reviews', icon: ClipboardList },
    { label: 'Meetings', path: '/mentor/meetings', icon: GraduationCap },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { label: 'Profile', path: `/profile/${user?._id || user?.id}`, icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
  ] : user?.role === 'Recruiter' ? [
    { label: 'Dashboard', path: '/recruiter', icon: LayoutDashboard },
    { label: 'Search Developers', path: '/recruiter/search', icon: Search },
    { label: 'Jobs Portal', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Saved Candidates', path: '/recruiter/saved', icon: Bookmark },
    { label: 'Shortlisted Candidates', path: '/recruiter/shortlist', icon: ClipboardList },
    { label: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
    { label: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { label: 'Profile', path: '/recruiter/profile', icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Marketplace', path: '/marketplace', icon: Compass },
    { label: 'Jobs Marketplace', path: '/jobs', icon: Briefcase },
    { label: 'My Applications', path: '/applications', icon: ClipboardList },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Recruitment Inbox', path: '/recruitment', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { label: 'Profile', path: `/profile/${user?._id || user?.id}`, icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'Admin') {
    menuItems.push({ label: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }
  if (user?.role === 'Recruiter') {
    menuItems.push({ label: 'Recruiter Hub', path: '/recruiter', icon: Briefcase });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setTimeout(() => {
      openAuthModal('login');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-all duration-300">
      {/* Persistent Sidebar (Desktop) */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden md:flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 justify-between p-4 relative flex-shrink-0"
      >
        <div className="space-y-6">
          {/* Logo & Toggle Header */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pb-2`}>
            <Link to="/" className="flex items-center space-x-2">
              <svg width="24" height="24" viewBox="0 0 100 100" className="text-brand-primary dark:text-brand-accent">
                <path d="M25,25 L55,25 L55,75 M55,25 L75,50 L55,75 M25,25 L25,75 L55,75" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
              {!isCollapsed && (
                <motion.span
                   initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent"
                >
                  DevMesh
                </motion.span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = (location.pathname + location.search) === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 glow-blue'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {item.count > 0 && !isCollapsed && (
                    <span className="bg-brand-error text-white font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  {item.count > 0 && isCollapsed && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-error border-2 border-white dark:border-slate-950" />
                  )}

                  {/* Collapse Hover Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg z-50 transition-all shadow shadow-xl duration-200 pointer-events-none whitespace-nowrap">
                      {item.label} {item.count > 0 ? `(${item.count})` : ''}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Toggle */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-900 flex flex-col space-y-4">
          <Link
            to={`/profile/${user?._id}`}
            className={`flex items-center group text-left ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          >
            <img
              src={getAvatarUrl(user?.avatar)}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-800 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-bold truncate group-hover:text-brand-accent transition-colors">
                  {user?.name}
                </span>
                <span className="block text-[10px] text-slate-500 font-mono tracking-wide truncate capitalize">
                  {user?.role} · {user?.reputation} REP
                </span>
              </div>
            )}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-brand-error hover:bg-red-500/10 dark:hover:bg-red-500/5 transition-all text-left w-full group relative ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
            {isCollapsed && (
              <div className="absolute left-16 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg z-50 transition-all shadow duration-200 pointer-events-none whitespace-nowrap">
                Log Out
              </div>
            )}
          </button>

          {/* Toggle Sidebar Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-xl border border-slate-200 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Persistent Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 grid grid-cols-5 py-2.5 text-slate-500 dark:text-slate-400 shadow-2xl">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = (location.pathname + location.search) === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-0.5 py-1 ${
                isActive ? 'text-brand-primary dark:text-brand-accent font-bold' : ''
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-brand-error text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4 md:space-x-0">
            <Link to="/" className="flex items-center space-x-2 md:hidden">
              <span className="font-bold text-md text-slate-900 dark:text-white">DevMesh</span>
            </Link>
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 w-64 focus-within:ring-2 focus-within:ring-brand-accent/20 focus-within:border-brand-accent/50 transition-all">
              <Compass className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Global search (projects, devs...)"
                onFocus={() => setGlobalSearchOpen(true)}
                className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-350 w-full focus:outline-none cursor-pointer"
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions / Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-error animate-pulse" />
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all focus:outline-none"
              >
                <img
                  src={getAvatarUrl(user?.avatar)}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-slate-300 dark:border-slate-800"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-2xl z-50 text-left">
                    <Link
                      to={`/profile/${user?._id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1.5 border-slate-200 dark:border-slate-800" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-brand-error hover:bg-red-500/10 dark:hover:bg-red-500/5 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View with staggered fade transition */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Search Modal overlay */}
      {globalSearchOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] transition-opacity" onClick={() => setGlobalSearchOpen(false)} />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-[101] max-h-[80vh] overflow-y-auto flex flex-col text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Global Workspace Search</h3>
              <button onClick={() => setGlobalSearchOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="my-4 relative">
              <input
                type="text"
                autoFocus
                placeholder="Search across projects, developers, tasks, and files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              />
              {searchLoading && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-450 font-mono">Searching...</span>
              )}
            </div>

            {/* Results Grid */}
            <div className="space-y-4 overflow-y-auto pr-1">
              {!searchQuery && (
                <div className="text-center py-6 text-slate-450 text-xs">
                  Type to search workspace indices...
                </div>
              )}
              {searchQuery && !searchLoading && Object.values(searchResults).every(arr => arr.length === 0) && (
                <div className="text-center py-6 text-slate-450 text-xs">
                  No matching workspace artifacts found.
                </div>
              )}

              {/* Projects */}
              {searchResults.projects?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-450 mb-2">Projects & Workspaces</h4>
                  <div className="space-y-1.5">
                    {searchResults.projects.map(p => (
                      <Link
                        key={p._id}
                        to={`/projects/${p._id}`}
                        onClick={() => setGlobalSearchOpen(false)}
                        className="block p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">{p.title}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{p.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Developers */}
              {searchResults.developers?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-450 mb-2">Developers</h4>
                  <div className="space-y-1.5">
                    {searchResults.developers.map(d => (
                      <Link
                        key={d._id}
                        to={`/profile/${d._id}`}
                        onClick={() => setGlobalSearchOpen(false)}
                        className="block p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">{d.name}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">Role: {d.role} • Skills: {d.skills?.join(', ') || 'None'}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {searchResults.tasks?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-450 mb-2">Tasks</h4>
                  <div className="space-y-1.5">
                    {searchResults.tasks.map(t => (
                      <Link
                        key={t._id}
                        to={`/dashboard`}
                        onClick={() => setGlobalSearchOpen(false)}
                        className="block p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">✓ {t.title}</span>
                        <span className="text-[10px] text-slate-450 block line-clamp-1">Status: {t.status} • Priority: {t.priority}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {searchResults.files?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-450 mb-2">Workspace Files</h4>
                  <div className="space-y-1.5">
                    {searchResults.files.map(f => (
                      <a
                        key={f._id}
                        href={`http://localhost:5000${f.url}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setGlobalSearchOpen(false)}
                        className="block p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">📁 {f.name}</span>
                        <span className="text-[10px] text-slate-450 block line-clamp-1">Size: {(f.sizeBytes / 1024).toFixed(1)} KB</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Mock dropdown down icon to clean compiles
const ChevronDown = ({ className }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Mock user icon
const UserIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default Layout;
