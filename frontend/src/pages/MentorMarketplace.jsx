import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  Filter,
  Bookmark,
  Users,
  Code,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';

const MentorMarketplace = () => {
  const [projects, setProjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [techStack, setTechStack] = useState('');
  const [duration, setDuration] = useState('');

  // Application Modal state
  const [selectedProjectForApply, setSelectedProjectForApply] = useState(null);
  const [coverMessage, setCoverMessage] = useState('');
  const [expertise, setExpertise] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [expectedContribution, setExpectedContribution] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  const fetchMarketplace = async () => {
    try {
      setLoading(true);
      // Fetch projects
      const res = await api.get('/mentor/marketplace');
      if (res.data.status === 'success') {
        setProjects(res.data.data.projects || []);
      }

      // Fetch bookmarks
      const bookRes = await api.get('/mentor/marketplace/bookmarks');
      if (bookRes.data.status === 'success') {
        setBookmarks(bookRes.data.data.projects.map(p => p._id) || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const handleBookmark = async (projectId) => {
    try {
      const res = await api.post(`/mentor/marketplace/${projectId}/bookmark`);
      if (res.data.status === 'success') {
        fetchMarketplace();
      }
    } catch (err) {
      alert('Failed to update bookmark.');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!coverMessage.trim() || !selectedProjectForApply) return;

    setSubmittingApp(true);
    try {
      const res = await api.post(`/mentor/marketplace/${selectedProjectForApply._id}/apply`, {
        message: coverMessage,
        expertise,
        experience,
        availability,
        expectedContribution
      });

      if (res.data.status === 'success') {
        alert('Application submitted successfully!');
        setSelectedProjectForApply(null);
        setCoverMessage('');
        setExpertise('');
        setExperience('');
        setAvailability('');
        setExpectedContribution('');
        fetchMarketplace();
      }
    } catch (err) {
      alert('Failed to submit cover application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Filter projects locally
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || p.category === category;
    const matchesDuration = !duration || p.duration === duration;
    const matchesTech = !techStack || p.skills?.some(s => s.toLowerCase().includes(techStack.toLowerCase()));

    return matchesSearch && matchesCategory && matchesDuration && matchesTech;
  });

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing Mentor Marketplace...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-850 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-505 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Marketplace Hub
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Compass className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Mentor Marketplace</span>
            </h2>
            <p className="text-xs text-slate-550">
              Browse student projects looking for guidance, filter by tech requirements, and submit cover applications.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-3xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 md:w-[450px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-50 border rounded-xl px-2 py-2.5 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Web Development">Web Dev</option>
                <option value="Mobile Development">Mobile</option>
                <option value="Machine Learning">AI/ML</option>
              </select>

              <input
                type="text"
                placeholder="Tech Stack..."
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
              />

              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-slate-50 border rounded-xl px-2 py-2.5 focus:outline-none"
              >
                <option value="">All Durations</option>
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Cards List */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 font-semibold">
            No projects matching your queries are looking for mentors.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((p) => {
              const isBookmarked = bookmarks.includes(p._id);
              return (
                <div key={p._id} className="rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-brand-primary/10 text-brand-primary border px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {p.category}
                      </span>
                      <button
                        onClick={() => handleBookmark(p._id)}
                        className={`p-1.5 border rounded-xl hover:bg-slate-50 transition-colors ${
                          isBookmarked ? 'bg-amber-50 text-amber-500 border-amber-200' : 'text-slate-400'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-800">{p.title}</h4>
                    <p className="text-[11px] text-slate-555 line-clamp-3 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-500">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase">Team Size</span>
                      <span className="font-semibold text-slate-700 flex items-center mt-0.5">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {p.members?.length + 1 || 1} Members
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase">Tech Stack</span>
                      <span className="font-semibold text-slate-700 flex items-center mt-0.5">
                        <Code className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {p.skills?.slice(0, 2).join(', ') || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase">Duration</span>
                      <span className="font-semibold text-slate-700 flex items-center mt-0.5">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {p.duration || '1 Month'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-455">Owner: {p.owner?.name}</span>
                    {p.hasApplied ? (
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${
                        p.applicationStatus === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : p.applicationStatus === 'Rejected'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : p.applicationStatus === 'Withdrawn'
                          ? 'bg-slate-50 text-slate-500 border-slate-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {p.applicationStatus === 'Pending' ? 'Applied (Pending)' : `Applied (${p.applicationStatus})`}
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedProjectForApply(p)}
                        className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow"
                      >
                        Apply as Mentor
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* APPLY MODAL */}
        <AnimatePresence>
          {selectedProjectForApply && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedProjectForApply(null)} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base">Apply as Project Mentor</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Project: {selectedProjectForApply.title}</p>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Cover Message</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Why do you want to mentor this team? Describe your suggestions..."
                      value={coverMessage}
                      onChange={(e) => setCoverMessage(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Expertise / Domain</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Machine Learning, React Architect"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Relevant Experience (Years / Projects)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 Years Senior ML Engineer"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Weekly Availability</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 hours/week, weekends"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Expected Contribution</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Design review, CI/CD setup guidance..."
                      value={expectedContribution}
                      onChange={(e) => setExpectedContribution(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProjectForApply(null)}
                      className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApp}
                      className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2"
                    >
                      {submittingApp ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MentorMarketplace;
