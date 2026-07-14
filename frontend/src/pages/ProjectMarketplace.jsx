import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  Filter,
  Bookmark,
  Share2,
  Users,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle,
  BookmarkCheck,
  Plus
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const ProjectMarketplace = () => {
  const [projects, setProjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, deadline, difficulty

  // Clipboard notify
  const [shareNotifyId, setShareNotifyId] = useState(null);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        setLoading(true);
        const [projRes, bookRes] = await Promise.all([
          api.get('/projects'),
          api.get('/users/bookmarks')
        ]);

        if (projRes.data.status === 'success') {
          setProjects(projRes.data.data.projects || []);
        }
        if (bookRes.data.status === 'success') {
          const bookedIds = bookRes.data.data.bookmarks?.map(p => p._id || p.id) || [];
          setBookmarks(bookedIds);
        }
      } catch (err) {
        console.error('Failed to fetch marketplace projects:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplaceData();
  }, []);

  const handleToggleBookmark = async (projectId) => {
    try {
      const res = await api.post('/users/bookmark', { developerId: projectId }); // Uses existing developerId payload mapping for bookmarks
      if (res.data.status === 'success') {
        const isBooked = res.data.isBookmarked;
        setBookmarks(prev => 
          isBooked ? [...prev, projectId] : prev.filter(id => id !== projectId)
        );
      }
    } catch (err) {
      // Fallback local toggle
      setBookmarks(prev =>
        prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
      );
    }
  };

  const handleShareProject = (projectId) => {
    const url = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(url);
    setShareNotifyId(projectId);
    setTimeout(() => {
      setShareNotifyId(null);
    }, 2000);
  };

  // Perform client side search filtering & sorting
  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.skillsRequired?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesDifficulty = selectedDifficulty ? p.difficulty === selectedDifficulty : true;
      const matchesWorkMode = selectedWorkMode ? p.workMode === selectedWorkMode : true;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesWorkMode;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'difficulty') {
        const difficultyWeight = { beginner: 1, intermediate: 2, advanced: 3 };
        const aWeight = difficultyWeight[a.difficulty] || 2;
        const bWeight = difficultyWeight[b.difficulty] || 2;
        return bWeight - aWeight;
      }
      return 0;
    });

  return (
    <Layout>
      <div className="space-y-8 text-left max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Project Marketplace</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse collaboration projects, filter requirements, and apply to open workspace positions.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              to="/projects/create"
              className="text-xs font-bold text-white bg-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center"
            >
              <Plus className="w-4.5 h-4.5 mr-1" />
              <span>Create Project</span>
            </Link>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-4 py-2.5 rounded-xl border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all"
            >
              Go to Dashboard &rarr;
            </Link>
          </div>
        </div>

        {/* Search controls row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
          {/* Query input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search title, skills required, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Apps">Mobile Apps</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="Blockchain & Web3">Blockchain & Web3</option>
            <option value="Game Development">Game Development</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="newest">Sort: Newest Published</option>
            <option value="deadline">Sort: Approaching Deadline</option>
            <option value="difficulty">Sort: Highest Difficulty</option>
          </select>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap gap-2.5">
          {/* Difficulty options */}
          {['beginner', 'intermediate', 'advanced'].map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? '' : diff)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                selectedDifficulty === diff
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white dark:bg-slate-950 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {diff}
            </button>
          ))}

          {/* Work Mode */}
          {['remote', 'hybrid'].map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedWorkMode(selectedWorkMode === mode ? '' : mode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                selectedWorkMode === mode
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white dark:bg-slate-950 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Listings grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono animate-pulse">
            Loading marketplace collections...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
            <Compass className="w-8 h-8 text-slate-400" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm">No Projects Found</h3>
              <p className="text-xs text-slate-500">
                Try loosening your filters or search keywords.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProjects.map((p, index) => {
                const isBookmarked = bookmarks.includes(p._id);
                const isSharingThis = shareNotifyId === p._id;

                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 p-6 shadow-sm flex flex-col justify-between hover:border-brand-primary/30 transition-all hover:scale-[1.01]"
                  >
                    {/* Header: Category + actions */}
                    <div className="flex justify-between items-start">
                      <span className="inline-block text-[10px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 rounded-full capitalize">
                        {p.category}
                      </span>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleToggleBookmark(p._id)}
                          className={`p-2 rounded-xl border transition-all ${
                            isBookmarked
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                          title="Bookmark Project"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleShareProject(p._id)}
                          className="p-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-slate-800 dark:hover:text-slate-200 transition-all relative"
                          title="Copy Link to Clipboard"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          {isSharingThis && (
                            <span className="absolute bottom-full right-0 mb-1 bg-emerald-500 text-white font-sans text-[8px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                              Copied!
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mt-4 space-y-1">
                      <Link to={`/projects/${p._id}`} className="block font-bold text-base hover:text-brand-primary transition-colors text-slate-800 dark:text-slate-200">
                        {p.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Metadata grids */}
                    <div className="grid grid-cols-2 gap-3.5 mt-5 pt-5 border-t border-slate-100 dark:border-slate-900 text-[11px] text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Team: {p.members?.length || 1} joined</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mode: {p.workMode || 'Remote'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Exp: {p.experienceLevel || 'Intermediate'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: {p.duration || '1 Month'}</span>
                      </div>
                    </div>

                    {/* Required Skills tags list */}
                    {p.skillsRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {p.skillsRequired.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-500 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {p.skillsRequired.length > 3 && (
                          <span className="text-[10px] text-slate-400 ml-1 font-bold">
                            +{p.skillsRequired.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom: Owner profile + Apply button */}
                    <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-100 dark:border-slate-900">
                      <div className="flex items-center space-x-2">
                        <img
                          src={getAvatarUrl(p.owner?.avatar)}
                          alt={p.owner?.name || 'Owner'}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 bg-slate-100"
                        />
                        <span className="text-[10px] font-semibold text-slate-650 dark:text-slate-400">
                          {p.owner?.name || 'Owner'}
                        </span>
                      </div>
                      <Link
                        to={`/projects/${p._id}`}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-850 text-white font-bold rounded-xl text-[10px] hover:bg-brand-primary hover:scale-[1.01] transition-all"
                      >
                        Apply to Project
                      </Link>
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

export default ProjectMarketplace;
