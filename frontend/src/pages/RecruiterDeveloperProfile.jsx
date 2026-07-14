import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Briefcase,
  Award,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  FileText,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Bookmark,
  Calendar,
  ChevronLeft
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const getFileUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const RecruiterDeveloperProfile = () => {
  const { developerId } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Private Candidate Notes state
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Bookmark / Shortlist state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shortlistStage, setShortlistStage] = useState('Shortlisted');
  const [shortlistNotes, setShortlistNotes] = useState('');
  const [showShortlistModal, setShowShortlistModal] = useState(false);

  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [submittingMsg, setSubmittingMsg] = useState(false);

  // Interview scheduler state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewDesc, setInterviewDesc] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewTimezone, setInterviewTimezone] = useState('GMT+5:30');
  const [interviewMode, setInterviewMode] = useState('Online');
  const [interviewMeetLink, setInterviewMeetLink] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [submittingInterview, setSubmittingInterview] = useState(false);

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recruiter/developers/${developerId}`);
      if (res.data.status === 'success') {
        setProfileData(res.data.data);
      }

      // Check bookmark status
      const bRes = await api.get('/recruiter/bookmarks');
      if (bRes.data.status === 'success') {
        const bookmarkedIds = bRes.data.data.developers.map(d => d._id);
        setIsBookmarked(bookmarkedIds.includes(developerId));
      }
    } catch (err) {
      console.error('Failed to load candidate profile details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (developerId) {
      fetchProfileDetails();
    }
  }, [developerId]);

  const handleBookmark = async () => {
    try {
      const res = await api.post(`/recruiter/bookmarks/${developerId}`);
      if (res.data.status === 'success') {
        alert(res.data.message || 'Bookmark updated!');
        fetchProfileDetails();
      }
    } catch (err) {
      alert('Failed to toggle bookmark.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await api.post(`/recruiter/developers/${developerId}/notes`, { content: noteContent });
      if (res.data.status === 'success') {
        setNoteContent('');
        fetchProfileDetails();
      }
    } catch (err) {
      alert('Failed to add candidate note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Remove this candidate evaluation note?')) return;
    try {
      const res = await api.delete(`/recruiter/notes/${noteId}`);
      if (res.data.status === 'success') {
        fetchProfileDetails();
      }
    } catch (err) {
      alert('Failed to delete note.');
    }
  };

  const handleShortlist = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/recruiter/shortlists/${developerId}`, {
        stage: shortlistStage,
        notes: shortlistNotes
      });
      if (res.data.status === 'success') {
        alert('Candidacy stage saved!');
        setShowShortlistModal(false);
        setShortlistNotes('');
        fetchProfileDetails();
      }
    } catch (err) {
      alert('Failed to shortlist developer.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    setSubmittingMsg(true);
    try {
      const res = await api.post('/recruiter/messages', {
        recipientId: developerId,
        content: messageContent
      });
      if (res.data.status === 'success') {
        alert('Message dispatched to candidate inbox!');
        setShowMessageModal(false);
        setMessageContent('');
      }
    } catch (err) {
      alert('Failed to send direct chat message.');
    } finally {
      setSubmittingMsg(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewTitle.trim() || !interviewDate || !interviewTime) return;

    setSubmittingInterview(true);
    try {
      const dateTime = new Date(`${interviewDate}T${interviewTime}`);
      const res = await api.post('/recruiter/interviews', {
        developerId,
        title: interviewTitle,
        description: interviewDesc,
        dateTime,
        mode: interviewMode,
        meetLink: interviewMeetLink,
        location: interviewLocation
      });

      if (res.data.status === 'success') {
        alert('Interview schedule confirmed & invitation emitted!');
        setShowInterviewModal(false);
        setInterviewTitle('');
        setInterviewDesc('');
        setInterviewDate('');
        setInterviewTime('');
        setInterviewMeetLink('');
        setInterviewLocation('');
      }
    } catch (err) {
      alert('Failed to schedule interview.');
    } finally {
      setSubmittingInterview(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing talent dossier repository...
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="p-12 text-center text-slate-450 font-bold bg-white max-w-4xl mx-auto rounded-3xl border">
          Failed to load candidate telemetry profile.
        </div>
      </Layout>
    );
  }

  const { developer, completedProjects, activeProjects, mentorReviews, activityTimeline, privateNotes } = profileData;

  // Mock commit logs
  const mockCommits = [
    { title: 'fix: optimize workspace socket reconnection latency', repo: 'react-kanban-board', date: 'Yesterday' },
    { title: 'feat: add file size compression hook in huddle uploads', repo: 'devmesh-collaboration', date: '3 days ago' },
    { title: 'refactor: extract team metrics to backend rep event schemas', repo: 'gamification-engine', date: '1 week ago' }
  ];

  // Mock contribution calendar matrix (53 weeks * 7 days)
  const contributionGrid = Array.from({ length: 98 }, () => Math.floor(Math.random() * 4));

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-6xl mx-auto pb-12 text-xs">
        {/* Navigation back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 font-bold text-slate-550 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Sourcing</span>
        </button>

        {/* Profile Card Banner */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 z-10">
            <img src={getAvatarUrl(developer.avatar)} alt="Avatar" className="w-16 h-16 rounded-full border object-cover shadow-sm bg-slate-100" />
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">{developer.name}</h2>
              <span className="block text-[10px] text-slate-400">{developer.college || 'DevMesh Member'}</span>
              <span className="block text-slate-550 mt-1 max-w-lg italic">"{developer.bio || 'Product builder exploring internships and project scopes.'}"</span>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end gap-4 z-10">
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl font-black text-sm">
              <Award className="w-4.5 h-4.5" />
              <span>{developer.reputation || 0} REP Points</span>
            </div>
            
            <div className="flex space-x-1.5">
              <button onClick={handleBookmark} className="p-2 border rounded-xl hover:bg-slate-5">
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-500 text-indigo-500' : 'text-slate-450'}`} />
              </button>
              <button onClick={() => setShowMessageModal(true)} className="p-2 border rounded-xl hover:bg-slate-5">
                <MessageSquare className="w-4 h-4 text-slate-550" />
              </button>
              <button onClick={() => setShowShortlistModal(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100">
                Shortlist Stage
              </button>
              <button onClick={() => setShowInterviewModal(true)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">
                Schedule Meet
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Technical stack & Badges */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Technical Skills & Credentials</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1.5">Technologies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {developer.skills?.map((s, idx) => (
                      <span key={idx} className="bg-slate-100 px-2.5 py-0.5 rounded text-[10px] font-bold text-slate-600">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1.5">Earned Badges</span>
                  {!developer.badges || developer.badges.filter(Boolean).length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">No gamification badges earned yet.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {developer.badges.filter(Boolean).map((b) => (
                        <div key={b._id} className="p-2 border rounded-xl bg-slate-50/50 flex items-center space-x-1.5">
                          <span className="text-base">{b.icon || '🏅'}</span>
                          <span className="font-bold text-slate-700 text-[10px]">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contribution heatmap & Weekly Activity logs */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Git Activity Heatmap & Weekly Logs</span>
              </h3>

              <div className="space-y-4">
                {/* Heatmap Grid */}
                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1.5">GitHub Contributions</span>
                  <div className="grid grid-flow-col grid-rows-7 gap-1 w-fit bg-slate-50 p-2.5 border rounded-2xl">
                    {contributionGrid.map((level, idx) => {
                      const colors = ['bg-slate-100', 'bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500'];
                      return <div key={idx} className={`w-2.5 h-2.5 rounded-sm ${colors[level]}`} />;
                    })}
                  </div>
                </div>

                {/* Commit log list */}
                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1.5">Recent Repository Commits</span>
                  <div className="space-y-2">
                    {mockCommits.map((c, idx) => (
                      <div key={idx} className="p-3 border rounded-xl bg-slate-50/20 flex justify-between items-center">
                        <div>
                          <span className="block font-bold text-slate-800">{c.title}</span>
                          <span className="block text-[8px] text-indigo-550 mt-0.5">{c.repo}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">{c.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Projects Workspace lists */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                <span>Completed Project Workspaces ({completedProjects.length})</span>
              </h3>

              {completedProjects.length === 0 ? (
                <div className="p-6 border border-dashed rounded-2xl text-center text-slate-450 italic">
                  No completed projects found in database logs.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedProjects.map((p) => (
                    <div key={p._id} className="p-4 border rounded-2xl space-y-2 hover:bg-slate-50/25">
                      <span className="bg-emerald-50 text-emerald-650 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">{p.category}</span>
                      <h4 className="font-bold text-sm text-slate-800">{p.title}</h4>
                      <p className="text-slate-550 line-clamp-2">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentor Ratings Review Logs */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                <span>Mentor Review evaluations</span>
              </h3>

              {mentorReviews.length === 0 ? (
                <div className="p-6 border border-dashed rounded-2xl text-center text-slate-450 italic">
                  No milestone feedback ratings recorded by academic mentors.
                </div>
              ) : (
                <div className="space-y-3">
                  {mentorReviews.map((r) => (
                    <div key={r._id} className="p-3.5 border rounded-2xl bg-slate-50/30 text-xs text-left space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <img src={getAvatarUrl(r.mentorId?.avatar)} alt="Avatar" className="w-7 h-7 rounded-full border object-cover" />
                          <span className="font-bold text-slate-800">{r.mentorId?.name || 'Academic Mentor'}</span>
                        </div>
                        <span className="font-black text-amber-500 text-[10px]">★ {r.rating || 5}.0</span>
                      </div>
                      <p className="text-slate-655 italic">"{r.feedback || 'Excellent milestone completion.'}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sourcing Actions & Private Notes column */}
          <div className="space-y-6 col-span-1">
            
            {/* Social Links & Resume directory */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base">Contact & Social Links</h3>
              <div className="space-y-3">
                {developer.socialLinks?.github && (
                  <a
                    href={developer.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 p-2.5 border rounded-xl hover:bg-slate-50/40"
                  >
                    <Github className="w-4 h-4 text-slate-800" />
                    <span className="font-bold text-slate-700">GitHub Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                  </a>
                )}

                {developer.socialLinks?.linkedin && (
                  <a
                    href={developer.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 p-2.5 border rounded-xl hover:bg-slate-50/40"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-700">LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                  </a>
                )}

                {developer.hackerrank && (
                  <a
                    href={developer.hackerrank}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 p-2.5 border rounded-xl hover:bg-slate-50/40"
                  >
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-slate-700">HackerRank Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                  </a>
                )}

                {developer.socialLinks?.website && (
                  <a
                    href={developer.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 p-2.5 border rounded-xl hover:bg-slate-50/40"
                  >
                    <Globe className="w-4 h-4 text-slate-655" />
                    <span className="font-bold text-slate-700">Portfolio Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                  </a>
                )}

                {!developer.socialLinks?.github &&
                 !developer.socialLinks?.linkedin &&
                 !developer.hackerrank &&
                 !developer.socialLinks?.website && (
                  <div className="text-[10px] text-slate-400 italic py-2 text-center">Social links unavailable.</div>
                )}

                {developer.resumeUrl ? (
                  <a
                    href={getFileUrl(developer.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={async () => {
                      try {
                        await api.post(`/recruiter/developers/${developerId}/resume-download`);
                      } catch (err) {
                        console.error('Failed to log resume download tracker:', err);
                      }
                    }}
                    className="flex items-center space-x-2 p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100/50"
                  >
                    <FileText className="w-4 h-4 text-indigo-650" />
                    <span className="font-bold text-indigo-750">Download Developer Resume</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400 ml-auto" />
                  </a>
                ) : (
                  <div className="text-[10px] text-slate-400 italic py-2 text-center border border-dashed rounded-xl bg-slate-50">Resume not uploaded.</div>
                )}
              </div>
            </div>

            {/* Candidate Private Notes block */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Private Candidate Notes</span>
              </h3>

              {/* Add Note form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. ✔ Strong React knowledge..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submittingNote ? 'Saving...' : 'Add Private Note'}</span>
                </button>
              </form>

              {/* Notes list */}
              {privateNotes.length === 0 ? (
                <div className="p-4 border border-dashed rounded-xl text-center text-slate-450 italic">
                  No private evaluation notes recorded.
                </div>
              ) : (
                <div className="space-y-3.5 pt-2 max-h-72 overflow-y-auto">
                  {privateNotes.map((n) => (
                    <div key={n._id} className="p-3 border rounded-xl bg-slate-50/30 flex justify-between items-start gap-2">
                      <p className="text-slate-655 font-bold leading-relaxed">{n.content}</p>
                      <button onClick={() => handleDeleteNote(n._id)} className="text-slate-400 hover:text-red-500 transition-colors pt-0.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity log Timeline */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-505" />
                <span>Recent Activity Timeline</span>
              </h3>

              {activityTimeline.length === 0 ? (
                <div className="p-4 text-center text-slate-400 italic">No timeline entries logged.</div>
              ) : (
                <div className="space-y-3 relative border-l border-slate-100 pl-4 ml-1">
                  {activityTimeline.map((log) => (
                    <div key={log._id} className="space-y-0.5 relative">
                      <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                      <span className="block font-bold text-slate-700">{log.action}</span>
                      <span className="block text-[9px] text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MODAL 1: MESSAGE MODAL */}
        <AnimatePresence>
          {showMessageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setShowMessageModal(false)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Message candidate</h3>
                </div>
                <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                  <textarea rows={4} required placeholder="Message content..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-3 focus:outline-none" />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowMessageModal(false)} className="w-1/2 py-2 border rounded-xl text-slate-500 font-bold">Cancel</button>
                    <button type="submit" disabled={submittingMsg} className="w-1/2 py-2 bg-brand-primary text-white rounded-xl font-bold shadow">{submittingMsg ? 'Sending...' : 'Send Message'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: SHORTLIST MODAL */}
        <AnimatePresence>
          {showShortlistModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setShowShortlistModal(false)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Add to Shortlist</h3>
                </div>
                <form onSubmit={handleShortlist} className="space-y-4 text-xs">
                  <select value={shortlistStage} onChange={(e) => setShortlistStage(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-2.5 focus:outline-none">
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <textarea rows={2} placeholder="Notes..." value={shortlistNotes} onChange={(e) => setShortlistNotes(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-3 focus:outline-none" />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowShortlistModal(false)} className="w-1/2 py-2 border rounded-xl text-slate-550 font-bold">Cancel</button>
                    <button type="submit" className="w-1/2 py-2 bg-indigo-650 text-white rounded-xl font-bold shadow">Confirm</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 3: INTERVIEW MODAL */}
        <AnimatePresence>
          {showInterviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setShowInterviewModal(false)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Schedule Interview</h3>
                </div>
                <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
                  <input type="text" required placeholder="Title" value={interviewTitle} onChange={(e) => setInterviewTitle(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-2.5 focus:outline-none" />
                  <textarea rows={2} placeholder="Description..." value={interviewDesc} onChange={(e) => setInterviewDesc(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-3 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" required value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="bg-slate-50 border rounded-xl p-2.5 focus:outline-none" />
                    <input type="time" required value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className="bg-slate-50 border rounded-xl p-2.5 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={interviewMode} onChange={(e) => setInterviewMode(e.target.value)} className="bg-slate-50 border rounded-xl p-2.5 focus:outline-none">
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                    <input type="text" value={interviewTimezone} onChange={(e) => setInterviewTimezone(e.target.value)} className="bg-slate-50 border rounded-xl p-2.5 focus:outline-none" />
                  </div>
                  {interviewMode === 'Online' ? (
                    <input type="url" placeholder="Google Meet link..." value={interviewMeetLink} onChange={(e) => setInterviewMeetLink(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-2.5 focus:outline-none" />
                  ) : (
                    <input type="text" placeholder="Office location address..." value={interviewLocation} onChange={(e) => setInterviewLocation(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-2.5 focus:outline-none" />
                  )}
                  <div className="flex space-x-2 pt-2">
                    <button type="button" onClick={() => setShowInterviewModal(false)} className="w-1/2 py-2 border rounded-xl text-slate-500 font-bold">Cancel</button>
                    <button type="submit" disabled={submittingInterview} className="w-1/2 py-2 bg-slate-900 text-white rounded-xl font-bold shadow">{submittingInterview ? 'Scheduling...' : 'Schedule'}</button>
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

export default RecruiterDeveloperProfile;
