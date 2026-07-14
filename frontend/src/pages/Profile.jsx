import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  User,
  GraduationCap,
  MapPin,
  Flame,
  Award,
  Link as LinkIcon,
  Github,
  Linkedin,
  FileText,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const Profile = () => {
  const { id } = useParams();
  const { user: loggedInUser, updateUserProfile } = useAuth();

  // Detail states
  const [profileUser, setProfileUser] = useState(null);
  const [repHistory, setRepHistory] = useState([]);
  const [portfolioProjects, setPortfolioProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recruitmentStats, setRecruitmentStats] = useState(null);

  // Upload actions states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const isMe = loggedInUser?._id === id || loggedInUser?.id === id;

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch profile and reputation history
      const profileRes = await api.get(`/users/profile/${id}`);
      if (profileRes.data.status === 'success') {
        setProfileUser(profileRes.data.data.user);
        setRepHistory(profileRes.data.data.repHistory || []);
      }

      // 2. Fetch portfolio projects
      const portRes = await api.get(`/users/portfolio/${id}`);
      if (portRes.data.status === 'success') {
        setPortfolioProjects(portRes.data.data.projects || []);
      }

      // 3. Fetch Recruitment stats if viewing self
      const myId = loggedInUser?._id || loggedInUser?.id;
      if (id === myId || id === 'me') {
        try {
          const recruitRes = await api.get('/users/recruitment-activity');
          if (recruitRes.data.status === 'success') {
            setRecruitmentStats(recruitRes.data.data.stats);
          }
        } catch (err) {
          console.warn('Failed to load recruitment stats:', err.message);
        }
      }
    } catch (err) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfileDetails();
    }
  }, [id]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setActionSuccess('');
    setActionError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        setActionSuccess('Profile photo updated successfully!');
        setProfileUser(prev => ({ ...prev, avatar: res.data.data.user.avatar }));
        if (isMe) {
          updateUserProfile(res.data.data.user);
        }
      }
    } catch (err) {
      setActionError('Failed to upload avatar photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setActionSuccess('');
    setActionError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/users/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        setActionSuccess('Resume CV uploaded successfully!');
        setProfileUser(prev => ({ ...prev, resumeUrl: res.data.data.resumeUrl }));
        if (isMe) {
          updateUserProfile({ ...loggedInUser, resumeUrl: res.data.data.resumeUrl });
        }
      }
    } catch (err) {
      setActionError('Failed to upload resume file.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-slate-500 font-mono text-xs animate-pulse">
          Fanning profile cards...
        </div>
      </Layout>
    );
  }

  if (error || !profileUser) {
    return (
      <Layout>
        <div className="text-center py-20 text-brand-error text-xs font-bold space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p>{error || 'User not found.'}</p>
        </div>
      </Layout>
    );
  }

  const activeProjects = portfolioProjects.filter((p) => p.status !== 'Completed');
  const completedProjects = portfolioProjects.filter((p) => p.status === 'Completed');

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
        {/* Banner Action alerts */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 rounded-xl text-xs font-semibold flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-3 bg-red-500/15 border border-red-500/25 text-red-500 rounded-xl text-xs font-semibold flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{actionError}</span>
          </div>
        )}

        {/* PROFILE HEADER CARD */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Avatar + basic details */}
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 relative z-10 text-center md:text-left">
            <div className="relative group">
              <img
                src={getAvatarUrl(profileUser.avatar)}
                alt={profileUser.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-brand-primary/30 bg-slate-100"
              />
              {isMe && (
                <label className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">{profileUser.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs">
                  <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-0.5 rounded-full capitalize font-semibold">
                    {profileUser.role}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                    profileUser.availabilityStatus === 'available'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {profileUser.availabilityStatus || 'Available'}
                  </span>
                </div>
              </div>

              {profileUser.college && (
                <div className="flex items-center text-xs text-slate-500">
                  <GraduationCap className="w-4 h-4 mr-1 text-slate-400" />
                  <span>College: {profileUser.college}</span>
                </div>
              )}

              {/* Social Links */}
              <div className="flex space-x-2.5 pt-1.5 justify-center md:justify-start">
                {profileUser.socialLinks?.github && (
                  <a href={profileUser.socialLinks.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                    <Github className="w-4.5 h-4.5" />
                  </a>
                )}
                {profileUser.socialLinks?.linkedin && (
                  <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-500">
                    <Linkedin className="w-4.5 h-4.5" />
                  </a>
                )}
                {profileUser.socialLinks?.website && (
                  <a href={profileUser.socialLinks.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-primary">
                    <LinkIcon className="w-4.5 h-4.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Rep score */}
          <div className="flex gap-4 md:flex-col items-center md:items-end relative z-10">
            <div className="text-center md:text-right bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 min-w-32">
              <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                Total REP Score
              </span>
              <span className="block text-2xl font-extrabold text-amber-600 tracking-tight mt-0.5">
                {profileUser.reputation || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recruitment Activity Tracker */}
        {isMe && recruitmentStats && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-3 text-left">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Recruitment Activity Tracker</h3>
            <div className="grid grid-cols-5 gap-3.5 text-center">
              <div className="p-3 border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/10">
                <span className="block text-lg font-black text-slate-700 dark:text-slate-200">{recruitmentStats.profileViewedCount || 0}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Profile Views</span>
              </div>
              <div className="p-3 border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/10">
                <span className="block text-lg font-black text-slate-700 dark:text-slate-200">{recruitmentStats.bookmarksCount || 0}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Bookmarks</span>
              </div>
              <div className="p-3 border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/10">
                <span className="block text-lg font-black text-slate-700 dark:text-slate-200">{recruitmentStats.shortlistedCount || 0}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Shortlisted</span>
              </div>
              <div className="p-3 border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/10">
                <span className="block text-lg font-black text-slate-700 dark:text-slate-200">{recruitmentStats.interviewsCount || 0}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Interviews</span>
              </div>
              <div className="p-3 border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/10">
                <span className="block text-lg font-black text-slate-700 dark:text-slate-200">{recruitmentStats.offersCount || 0}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Offers</span>
              </div>
            </div>
          </div>
        )}

        {/* BIOGRAPHY & SKILLS METADATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bio statement */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-base">Biography</h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
              {profileUser.bio || 'This developer has not set their biography statement yet.'}
            </p>
          </div>

          {/* Skills & Tech Stack */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Skills</h3>
              {profileUser.skills?.length === 0 ? (
                <div className="text-slate-450 text-xs italic">No skills listed yet.</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profileUser.skills?.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-xl text-[10px] text-slate-500 font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-900">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Tech Stack</h3>
              {profileUser.techStack?.length === 0 ? (
                <div className="text-slate-450 text-xs italic">No tech stack listed yet.</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profileUser.techStack?.map((stack, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-xl text-[10px] font-bold"
                    >
                      {stack}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE & COMPLETED PORTFOLIO PROJECTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Collabs */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base">Active Collaborations ({activeProjects.length})</h3>
            {activeProjects.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                No active collaboration projects.
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10"
                  >
                    <div className="space-y-0.5 text-left">
                      <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                        {p.title}
                      </span>
                      <span className="block text-[10px] text-slate-400 capitalize">
                        Status: {p.status || 'Planning'}
                      </span>
                    </div>
                    <Link
                      to={`/projects/${p._id}`}
                      className="text-[10px] font-bold text-brand-primary hover:underline flex items-center"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Projects */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-emerald-500">Completed Projects ({completedProjects.length})</h3>
            {completedProjects.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                No completed workspace projects listed.
              </div>
            ) : (
              <div className="space-y-3">
                {completedProjects.map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between items-center p-3 border border-emerald-500/10 rounded-2xl bg-emerald-500/5"
                  >
                    <div className="space-y-0.5 text-left">
                      <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                        {p.title}
                      </span>
                      <span className="block text-[10px] text-emerald-500 font-semibold">
                        Milestone Achieved ✓
                      </span>
                    </div>
                    <Link
                      to={`/projects/${p._id}`}
                      className="text-[10px] font-bold text-brand-primary hover:underline flex items-center"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESUME CV PREVIEW FRAME */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Resume / CV Document</h3>
            {isMe && (
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
                <UploadCloud className="w-4 h-4" />
                <span>{uploadingResume ? 'Uploading...' : 'Upload PDF'}</span>
                <input type="file" accept=".pdf" onChange={handleResumeChange} className="hidden" />
              </label>
            )}
          </div>

          {profileUser.resumeUrl ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3 text-left">
                  <FileText className="w-8 h-8 text-brand-primary" />
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Curriculum_Vitae.pdf
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Uploaded File Document
                    </span>
                  </div>
                </div>
                <a
                  href={`http://localhost:5000${profileUser.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-850 hover:bg-brand-primary hover:text-white text-white rounded-xl text-[10px] font-bold transition-all shadow"
                >
                  Download PDF
                </a>
              </div>

              {/* Iframe preview for desktop browsers */}
              <div className="w-full h-80 rounded-2xl border border-slate-200 dark:border-slate-850 overflow-hidden bg-slate-100">
                <iframe
                  src={`http://localhost:5000${profileUser.resumeUrl}`}
                  title="Resume Preview"
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 border border-dashed border-slate-250 dark:border-slate-850 rounded-3xl text-center text-xs text-slate-400">
              No Resume PDF CV document uploaded yet.
            </div>
          )}
        </div>

        {/* REPUTATION TRANSACTION LOGS & BADGES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reputation history logs */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-slate-450" />
              <span>Reputation Log History</span>
            </h3>

            {repHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                No reputation points logged.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {repHistory.map((event) => (
                  <div
                    key={event._id}
                    className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/10 dark:bg-slate-900/5 text-xs"
                  >
                    <div className="text-left space-y-0.5">
                      <span className="block font-bold text-slate-800 dark:text-slate-200">
                        {event.type.replace(/_/g, ' ')}
                      </span>
                      {event.projectId && (
                        <span className="block text-[10px] text-slate-400">
                          Project: {event.projectId.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`font-mono font-bold text-sm ${event.points > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {event.points > 0 ? `+${event.points}` : event.points} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges Collection */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center">
              <Award className="w-5 h-5 mr-2 text-slate-450" />
              <span>Earned Badges</span>
            </h3>

            {!profileUser.badges || profileUser.badges.filter(Boolean).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                Complete tasks to earn badges!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {profileUser.badges.filter(Boolean).map((badge) => (
                  <div
                    key={badge._id}
                    className="border border-slate-200 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 hover:scale-[1.02] transition-transform"
                    title={badge.description}
                  >
                    <div className="text-2xl">{badge.icon || '🏅'}</div>
                    <span className="block text-[10px] font-bold text-slate-800 dark:text-slate-200">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
