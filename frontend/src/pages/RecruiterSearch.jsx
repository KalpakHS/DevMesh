import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Bookmark,
  Users,
  Code,
  Award,
  Video,
  ExternalLink,
  MessageSquare,
  ClipboardList,
  Calendar,
  CheckCircle,
  FileText
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

const RecruiterSearch = () => {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState('');
  const [college, setCollege] = useState('');
  const [availability, setAvailability] = useState('');
  const [minRep, setMinRep] = useState('');
  const [sortBy, setSortBy] = useState('reputation'); // reputation, newest, alphabetical

  // Modal States
  const [selectedDevForProfile, setSelectedDevForProfile] = useState(null);
  const [selectedDevForMessage, setSelectedDevForMessage] = useState(null);
  const [selectedDevForShortlist, setSelectedDevForShortlist] = useState(null);
  const [selectedDevForInterview, setSelectedDevForInterview] = useState(null);

  // Form States
  const [messageContent, setMessageContent] = useState('');
  const [shortlistStage, setShortlistStage] = useState('Shortlisted');
  const [shortlistNotes, setShortlistNotes] = useState('');
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewDesc, setInterviewDesc] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewTimezone, setInterviewTimezone] = useState('GMT+5:30');
  const [interviewMode, setInterviewMode] = useState('Online');
  const [interviewMeetLink, setInterviewMeetLink] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');

  // Submit states
  const [submittingMsg, setSubmittingMsg] = useState(false);
  const [submittingShortlist, setSubmittingShortlist] = useState(false);
  const [submittingInterview, setSubmittingInterview] = useState(false);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (skills) params.append('skills', skills);
      if (college) params.append('college', college);
      if (availability) params.append('availability', availability);
      if (minRep) params.append('minRep', minRep);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/recruiter/developers?${params.toString()}`);
      if (res.data.status === 'success') {
        setDevelopers(res.data.data.developers || []);
      }

      // Load bookmarks count
      const bRes = await api.get('/recruiter/bookmarks');
      if (bRes.data.status === 'success') {
        setBookmarks(bRes.data.data.developers.map(d => d._id) || []);
      }
    } catch (err) {
      console.error('Failed to load developers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, [search, skills, college, availability, minRep, sortBy]);

  const handleBookmark = async (devId) => {
    try {
      const res = await api.post(`/recruiter/bookmarks/${devId}`);
      if (res.data.status === 'success') {
        alert(res.data.message || 'Bookmark updated!');
        fetchDevelopers();
      }
    } catch (err) {
      alert('Failed to update bookmark status.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedDevForMessage) return;

    setSubmittingMsg(true);
    try {
      const res = await api.post('/recruiter/messages', {
        recipientId: selectedDevForMessage._id,
        content: messageContent
      });
      if (res.data.status === 'success') {
        alert('Message sent successfully!');
        setSelectedDevForMessage(null);
        setMessageContent('');
      }
    } catch (err) {
      alert('Failed to send private message.');
    } finally {
      setSubmittingMsg(false);
    }
  };

  const handleShortlist = async (e) => {
    e.preventDefault();
    if (!selectedDevForShortlist) return;

    setSubmittingShortlist(true);
    try {
      const res = await api.post(`/recruiter/shortlists/${selectedDevForShortlist._id}`, {
        stage: shortlistStage,
        notes: shortlistNotes
      });
      if (res.data.status === 'success') {
        alert('Candidate shortlisted successfully!');
        setSelectedDevForShortlist(null);
        setShortlistNotes('');
      }
    } catch (err) {
      alert('Failed to add candidate to shortlist.');
    } finally {
      setSubmittingShortlist(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedDevForInterview) return;

    const fullDateTime = new Date(`${interviewDate}T${interviewTime}`);
    if (isNaN(fullDateTime.getTime())) {
      alert('Please specify a valid date and time.');
      return;
    }

    setSubmittingInterview(true);
    try {
      const res = await api.post('/recruiter/interviews', {
        developerId: selectedDevForInterview._id,
        title: interviewTitle,
        description: interviewDesc,
        dateTime: fullDateTime.toISOString(),
        timezone: interviewTimezone,
        mode: interviewMode,
        meetLink: interviewMeetLink,
        location: interviewLocation
      });
      if (res.data.status === 'success') {
        alert('Interview scheduled successfully!');
        setSelectedDevForInterview(null);
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

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-505 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Talent Sourcing Board
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Search Developers</span>
            </h2>
            <p className="text-xs text-slate-550">
              Query the developer directories by stack, reputation, college, or availability, and engage them directly.
            </p>
          </div>
        </div>

        {/* Query Controls bar */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 border rounded-3xl shadow-sm">
          <div className="flex flex-col space-y-1 md:col-span-2">
            <span className="font-bold text-slate-450 uppercase text-[8px]">Search Name/Bio</span>
            <div className="relative">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 border rounded-xl pl-9 pr-3 py-2 w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="font-bold text-slate-450 uppercase text-[8px]">Skills / Stack</span>
            <input
              type="text"
              placeholder="e.g. React, Node"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <span className="font-bold text-slate-450 uppercase text-[8px]">College</span>
            <input
              type="text"
              placeholder="e.g. Stanford"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <span className="font-bold text-slate-450 uppercase text-[8px]">Availability</span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="">All States</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="font-bold text-slate-450 uppercase text-[8px]">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none font-bold"
            >
              <option value="reputation">Highest REP</option>
              <option value="newest">Newest Candidates</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-450 animate-pulse">Querying registered candidates...</div>
        ) : developers.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 font-bold bg-white">
            No developers match your query parameters. Try widening filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {developers.map((dev) => {
              const isBookmarked = bookmarks.includes(dev._id);
              return (
                <div key={dev._id} className="rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2.5">
                        <img src={getAvatarUrl(dev.avatar)} alt="Avatar" className="w-10 h-10 rounded-full border object-cover" />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800">{dev.name}</h4>
                          <span className="block text-[9px] text-slate-400">{dev.college || 'DevMesh Member'}</span>
                        </div>
                      </div>
                      <button onClick={() => handleBookmark(dev._id)}>
                        <Bookmark className={`w-4 h-4 transition-colors ${isBookmarked ? 'fill-indigo-500 text-indigo-500' : 'text-slate-400'}`} />
                      </button>
                    </div>

                    <p className="text-slate-550 leading-relaxed line-clamp-2">
                      {dev.bio || 'Product builder exploring internships and project scopes.'}
                    </p>

                    <div>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1">Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {dev.skills?.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[9px]">{s}</span>
                        ))}
                        {dev.skills?.length > 4 && <span className="text-[9px] text-slate-400">+{dev.skills.length - 4} more</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t">
                      <div className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-slate-700">{dev.reputation || 0} REP</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                        dev.availabilityStatus === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>{dev.availabilityStatus || 'available'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    <button
                      onClick={() => navigate(`/recruiter/developers/${dev._id}`)}
                      className="py-2 border rounded-xl hover:bg-slate-50 font-bold text-center"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setSelectedDevForMessage(dev)}
                      className="py-2 border rounded-xl hover:bg-slate-50 font-bold text-center flex items-center justify-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => setSelectedDevForShortlist(dev)}
                      className="py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 font-bold text-center col-span-1"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => setSelectedDevForInterview(dev)}
                      className="py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-center col-span-1"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: DEVELOPER DETAIL VIEW OVERLAY */}
        <AnimatePresence>
          {selectedDevForProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setSelectedDevForProfile(null)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-4 text-left text-xs max-h-[85vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start pb-3 border-b">
                  <div className="flex items-center space-x-3">
                    <img src={getAvatarUrl(selectedDevForProfile.avatar)} alt="Avatar" className="w-12 h-12 rounded-full border object-cover" />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800">{selectedDevForProfile.name}</h3>
                      <span className="block text-[10px] text-slate-400">{selectedDevForProfile.college || 'DevMesh Member'}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded font-black text-xs">{selectedDevForProfile.reputation || 0} REP</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Bio / Description</span>
                    <p className="text-slate-655 leading-relaxed italic">"{selectedDevForProfile.bio || 'No bio specified.'}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1">Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDevForProfile.skills?.map((s, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[9px]">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1">Status details</span>
                      <span className="block font-bold text-slate-700 uppercase">{selectedDevForProfile.availabilityStatus || 'available'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t text-right">
                    {selectedDevForProfile.resumeUrl ? (
                      <a
                        href={getFileUrl(selectedDevForProfile.resumeUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 border rounded-xl bg-slate-50 hover:bg-slate-100 font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Download Resume</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No resume uploaded.</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t text-right">
                  <button
                    onClick={() => setSelectedDevForProfile(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: MESSAGE MODAL */}
        <AnimatePresence>
          {selectedDevForMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setSelectedDevForMessage(null)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Message {selectedDevForMessage.name}</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Send a direct message to this candidate's inbox:</p>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Message Content</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write your message details..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDevForMessage(null)}
                      className="w-1/2 py-2 border rounded-xl text-slate-500 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingMsg}
                      className="w-1/2 py-2 bg-brand-primary text-white rounded-xl font-bold shadow"
                    >
                      {submittingMsg ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 3: SHORTLIST MODAL */}
        <AnimatePresence>
          {selectedDevForShortlist && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setSelectedDevForShortlist(null)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Add to Shortlist</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Shortlist {selectedDevForShortlist.name} to hiring stages:</p>
                </div>

                <form onSubmit={handleShortlist} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-455">Hiring Stage</label>
                    <select
                      value={shortlistStage}
                      onChange={(e) => setShortlistStage(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    >
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Notes / Remarks</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. strong frontend skills..."
                      value={shortlistNotes}
                      onChange={(e) => setShortlistNotes(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDevForShortlist(null)}
                      className="w-1/2 py-2 border rounded-xl text-slate-500 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingShortlist}
                      className="w-1/2 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow"
                    >
                      {submittingShortlist ? 'Adding...' : 'Confirm Shortlist'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 4: INTERVIEW MODAL */}
        <AnimatePresence>
          {selectedDevForInterview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setSelectedDevForInterview(null)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Schedule Interview</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Schedule meet with {selectedDevForInterview.name}:</p>
                </div>

                <form onSubmit={handleScheduleInterview} className="space-y-3.5">
                  <div className="flex flex-col space-y-1">
                    <label className="font-bold text-slate-450">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technical System Design Interview"
                      value={interviewTitle}
                      onChange={(e) => setInterviewTitle(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="font-bold text-slate-450">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Specify session details..."
                      value={interviewDesc}
                      onChange={(e) => setInterviewDesc(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-450">Date</label>
                      <input
                        type="date"
                        required
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-450">Time</label>
                      <input
                        type="time"
                        required
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-450">Mode</label>
                      <select
                        value={interviewMode}
                        onChange={(e) => setInterviewMode(e.target.value)}
                        className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                      >
                        <option value="Online">Online Meet</option>
                        <option value="Offline">In-Person</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-450">Timezone</label>
                      <input
                        type="text"
                        value={interviewTimezone}
                        onChange={(e) => setInterviewTimezone(e.target.value)}
                        className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  {interviewMode === 'Online' ? (
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-455">Google Meet Link</label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        value={interviewMeetLink}
                        onChange={(e) => setInterviewMeetLink(e.target.value)}
                        className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-455">Office Location Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Suite 400, Mountain View CA"
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                        className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDevForInterview(null)}
                      className="w-1/2 py-2.5 border rounded-xl text-slate-550 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingInterview}
                      className="w-1/2 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow animate-pulse"
                    >
                      {submittingInterview ? 'Scheduling...' : 'Schedule Interview'}
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

export default RecruiterSearch;
