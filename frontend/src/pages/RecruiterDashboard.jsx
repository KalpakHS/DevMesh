import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Bookmark,
  ClipboardList,
  Calendar,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Award,
  Search,
  Clock,
  Briefcase,
  PieChart,
  BarChart2,
  Settings,
  Building,
  Image,
  Globe,
  Paperclip,
  CheckCircle,
  Plus
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const getCompanyLogoUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs: 'overview', 'analytics', 'company'
  const [activeTab, setActiveTab] = useState('overview');

  // Notification category filter
  const [notifCategory, setNotifCategory] = useState('all');

  // Company Profile form state
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [employees, setEmployees] = useState('');
  const [locations, setLocations] = useState('');
  const [culture, setCulture] = useState('');
  const [benefits, setBenefits] = useState('');
  const [followers, setFollowers] = useState([]);
  const [submittingCompany, setSubmittingCompany] = useState(false);
  const [profileId, setProfileId] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/dashboard');
      if (res.data.status === 'success') {
        setData(res.data.data);
      }

      // Fetch company profile settings
      const profRes = await api.get('/recruiter/profile');
      if (profRes.data.status === 'success') {
        const profile = profRes.data.data.profile;
        if (profile) {
          setProfileId(profile._id);
          setCompany(profile.company || '');
          setIndustry(profile.industry || '');
          setLocation(profile.location || '');
          setAbout(profile.about || '');
          setWebsite(profile.website || '');
          setLinkedIn(profile.linkedIn || '');
          setCompanyLogo(profile.companyLogo || '');
          setBanner(profile.banner || '');
          setEmployees(profile.employees || '');
          setLocations(profile.locations?.join(', ') || '');
          setCulture(profile.culture || '');
          setBenefits(profile.benefits || '');
          setFollowers(profRes.data.data.followers || []);
        }
      }
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateCompanyProfile = async (e) => {
    e.preventDefault();
    setSubmittingCompany(true);
    try {
      const locArray = locations.split(',').map(l => l.trim()).filter(Boolean);
      const res = await api.put('/recruiter/profile', {
        company,
        industry,
        location,
        about,
        website,
        linkedIn,
        companyLogo,
        banner,
        employees,
        locations: locArray,
        culture,
        benefits
      });
      if (res.data.status === 'success') {
        alert('Company profile updated successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to update company profile.');
    } finally {
      setSubmittingCompany(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing recruiter dashboard data desk...
        </div>
      </Layout>
    );
  }

  const stats = data?.stats || {
    totalDevelopers: 0,
    savedCandidates: 0,
    shortlistedCandidates: 0,
    interviewsScheduled: 0,
    activeConversations: 0
  };

  const topDevelopers = data?.topDevelopers || [];
  const recentDevelopers = data?.recentDevelopers || [];
  const upcomingInterviews = data?.upcomingInterviews || [];
  const notifications = data?.notifications || [];

  // Filter notifications locally by simulated category
  const filteredNotifications = notifications.filter(n => {
    if (notifCategory === 'all') return true;
    if (notifCategory === 'messages') return n.type === 'RECRUITER_MESSAGE_SENT';
    if (notifCategory === 'interviews') return n.type === 'INTERVIEW_SCHEDULED' || n.type === 'INTERVIEW_CANCELLED';
    if (notifCategory === 'shortlists') return n.type === 'RECRUITER_SHORTLISTED_CANDIDATE';
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Hiring Command Center
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Recruiter Dashboard</span>
            </h2>
            <p className="text-xs text-slate-550 max-w-lg mt-0.5">
              Discover top engineering talent, track candidates throughout the pipeline, and manage company credentials.
            </p>
          </div>

          {/* Toggle view tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl border">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'analytics', label: 'Hiring Analytics' },
              { id: 'company', label: 'Company Profile' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl font-bold transition-all text-[10px] uppercase ${
                  activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Developers', val: stats.totalDevelopers, color: 'text-indigo-600' },
            { label: 'Saved Candidates', val: stats.savedCandidates, color: 'text-blue-600' },
            { label: 'Shortlisted', val: stats.shortlistedCandidates, color: 'text-emerald-600' },
            { label: 'Scheduled Interviews', val: stats.interviewsScheduled, color: 'text-red-600' },
            { label: 'Active Conversations', val: stats.activeConversations, color: 'text-amber-600' }
          ].map((stat, idx) => (
            <div key={idx} className="rounded-3xl border bg-white p-5 shadow-sm space-y-1">
              <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">{stat.label}</span>
              <span className={`block text-xl font-black ${stat.color}`}>{stat.val}</span>
            </div>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/recruiter/search')}
                className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:border-indigo-400/40 shadow-sm transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-sm text-slate-800">Search Developers</span>
                    <span className="block text-[10px] text-slate-450">Find candidates with filters</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/recruiter/saved')}
                className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:border-indigo-400/40 shadow-sm transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-sm text-slate-800">Saved Candidates</span>
                    <span className="block text-[10px] text-slate-450">Review candidate bookmarks</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/recruiter/interviews')}
                className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:border-indigo-400/40 shadow-sm transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-red-50 text-red-650">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-sm text-slate-800">Schedule Interview</span>
                    <span className="block text-[10px] text-slate-450">Create candidate meet sessions</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/recruiter/jobs')}
                className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:border-indigo-400/40 shadow-sm transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-sm text-slate-800">Jobs Portal</span>
                    <span className="block text-[10px] text-slate-455">Manage job requisitions</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Top Developers by REP */}
                <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base flex items-center">
                    <Award className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>Top Developers (by Reputation Score)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topDevelopers.map((dev) => (
                      <div
                        key={dev._id}
                        onClick={() => navigate(`/recruiter/developers/${dev._id}`)}
                        className="p-4 border rounded-2xl flex items-center justify-between hover:bg-slate-50/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={getAvatarUrl(dev.avatar)} alt="Avatar" className="w-9 h-9 rounded-full border object-cover bg-slate-100" />
                          <div>
                            <span className="block font-bold text-slate-800">{dev.name}</span>
                            <span className="block text-[9px] text-slate-400">{dev.college || 'DevMesh Member'}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold text-[9px]">{dev.reputation || 0} REP</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently Joined */}
                <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                    <span>New Developer Registrations</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentDevelopers.map((dev) => (
                      <div
                        key={dev._id}
                        onClick={() => navigate(`/recruiter/developers/${dev._id}`)}
                        className="p-4 border rounded-2xl flex items-center justify-between hover:bg-slate-50/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={getAvatarUrl(dev.avatar)} alt="Avatar" className="w-9 h-9 rounded-full border object-cover bg-slate-100" />
                          <div>
                            <span className="block font-bold text-slate-800">{dev.name}</span>
                            <span className="block text-[9px] text-slate-400">{dev.skills?.slice(0, 2).join(', ') || 'Developer'}</span>
                          </div>
                        </div>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold text-[9px]">{dev.availabilityStatus || 'Available'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar items */}
              <div className="space-y-6">
                {/* Interviews this week */}
                <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-red-500" />
                    <span>Interviews This Week</span>
                  </h3>

                  {upcomingInterviews.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-2xl text-center text-slate-450 italic">
                      No interviews scheduled this week.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingInterviews.map((iv) => (
                        <div key={iv._id} className="p-3.5 border rounded-2xl bg-slate-50/30 text-xs text-left space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="block font-extrabold text-slate-800">{iv.title}</span>
                              <span className="block text-[9px] text-slate-400">Candidate: {iv.developerId?.name}</span>
                            </div>
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">{iv.mode}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-455 pt-1 border-t border-slate-100">
                            <span>📅 {new Date(iv.dateTime).toLocaleDateString()}</span>
                            <span>⏰ {new Date(iv.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart 1: Demanded skills */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-indigo-505" />
                <span>Demanded Developer Skills</span>
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { name: 'React.js', pct: '88%' },
                  { name: 'Node.js', pct: '74%' },
                  { name: 'Python / Django', pct: '62%' },
                  { name: 'TypeScript', pct: '55%' },
                  { name: 'PostgreSQL', pct: '48%' }
                ].map((sk, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-[10px]">
                      <span className="text-slate-700">{sk.name}</span>
                      <span className="text-indigo-600">{sk.pct}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: sk.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Hiring by College */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-505" />
                <span>Marketplace Placements by College</span>
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { name: 'Stanford University', count: 14 },
                  { name: 'MIT', count: 11 },
                  { name: 'UC Berkeley', count: 9 },
                  { name: 'IIT Bombay', count: 8 },
                  { name: 'Carnegie Mellon', count: 5 }
                ].map((coll, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b pb-2">
                    <span className="font-bold text-slate-700">{coll.name}</span>
                    <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded font-black text-[9px]">{coll.count} hires</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3: REP Score Curves */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-505" />
                <span>REP Score Curves</span>
              </h3>
              <div className="h-40 flex items-end justify-between px-2 pt-6 border-b border-l border-slate-100">
                <div className="w-6 bg-indigo-500/20 hover:bg-indigo-500 rounded-t h-[20%]" title="100-300 REP" />
                <div className="w-6 bg-indigo-500/40 hover:bg-indigo-500 rounded-t h-[50%]" title="300-500 REP" />
                <div className="w-6 bg-indigo-500/80 hover:bg-indigo-500 rounded-t h-[90%]" title="500-800 REP" />
                <div className="w-6 bg-indigo-500/60 hover:bg-indigo-500 rounded-t h-[60%]" title="800-1000 REP" />
                <div className="w-6 bg-indigo-550 hover:bg-indigo-600 rounded-t h-[30%]" title="1000+ REP" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-450 font-mono mt-1">
                <span>100-300</span><span>300-500</span><span>500-800</span><span>800-1k</span><span>1k+</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPANY PROFILE EDITOR */}
        {activeTab === 'company' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form editor */}
            <div className="lg:col-span-2 rounded-3xl border bg-white p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-base flex items-center border-b pb-3">
                <Building className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Manage Organization Credentials</span>
              </h3>

              <form onSubmit={handleUpdateCompanyProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Company Name</label>
                  <input
                    required
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Company Logo URL</label>
                  <input
                    type="text"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Banner URL</label>
                  <input
                    type="text"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Website URL</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Employee Size (range)</label>
                  <input
                    type="text"
                    placeholder="e.g. 50-100"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Locations (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, San Francisco"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">About Company</label>
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="border rounded-xl p-3 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Culture & Values</label>
                  <textarea
                    rows={2}
                    value={culture}
                    onChange={(e) => setCulture(e.target.value)}
                    className="border rounded-xl p-3 w-full focus:outline-none"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Benefits & Perks</label>
                  <textarea
                    rows={2}
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="border rounded-xl p-3 w-full focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingCompany}
                  className="md:col-span-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {submittingCompany ? 'Saving profile credentials...' : 'Save Organization Profile'}
                </button>
              </form>
            </div>

            {/* Followers Tracker */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-base flex items-center border-b pb-3">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Organization Followers ({followers.length})</span>
              </h3>

              {followers.length === 0 ? (
                <div className="p-6 border border-dashed rounded-xl text-center text-slate-400 italic">
                  No developers are currently following your company.
                </div>
              ) : (
                <div className="space-y-3">
                  {followers.map((f) => (
                    <div key={f._id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-2">
                        <img src={getAvatarUrl(f.avatar)} alt="Avatar" className="w-8 h-8 rounded-full border object-cover bg-slate-100" />
                        <div>
                          <span className="font-bold text-slate-800 block">{f.name}</span>
                          <span className="text-[9px] text-slate-400 block">{f.email}</span>
                        </div>
                      </div>
                      <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold text-[8px]">{f.reputation || 0} REP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecruiterDashboard;
