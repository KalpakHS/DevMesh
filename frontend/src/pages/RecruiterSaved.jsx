import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Award,
  Video,
  ExternalLink,
  MessageSquare,
  ClipboardList,
  Calendar,
  XCircle,
  FileText,
  Eye
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const RecruiterSaved = () => {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedDevForProfile, setSelectedDevForProfile] = useState(null);
  const [selectedDevForMessage, setSelectedDevForMessage] = useState(null);
  const [selectedDevForShortlist, setSelectedDevForShortlist] = useState(null);
  const [selectedDevForInterview, setSelectedDevForInterview] = useState(null);

  // Form states
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

  const [submittingMsg, setSubmittingMsg] = useState(false);
  const [submittingShortlist, setSubmittingShortlist] = useState(false);
  const [submittingInterview, setSubmittingInterview] = useState(false);

  const fetchSavedDevelopers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/bookmarks');
      if (res.data.status === 'success') {
        setDevelopers(res.data.data.developers || []);
      }
    } catch (err) {
      console.error('Failed to load saved candidates:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedDevelopers();
  }, []);

  const handleRemoveBookmark = async (devId) => {
    try {
      const res = await api.post(`/recruiter/bookmarks/${devId}`);
      if (res.data.status === 'success') {
        alert('Candidate bookmark removed.');
        fetchSavedDevelopers();
      }
    } catch (err) {
      alert('Failed to remove candidate bookmark.');
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
      alert('Failed to send message.');
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
        alert('Candidate shortlisted!');
        setSelectedDevForShortlist(null);
        setShortlistNotes('');
      }
    } catch (err) {
      alert('Failed to shortlist candidate.');
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
        alert('Interview scheduled!');
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

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing candidate bookmarks list...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-505 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Saved Directory
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Bookmark className="w-5 h-5 mr-2 text-indigo-500 fill-indigo-500" />
              <span>Saved Candidates</span>
            </h2>
            <p className="text-xs text-slate-550">
              Manage talent bookmarks, monitor availability changes, and initiate pipeline screening actions.
            </p>
          </div>
        </div>

        {/* Saved List Grid */}
        {developers.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 font-bold bg-white">
            You haven't bookmarked any candidates yet. Search talent pool to add candidates.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {developers.map((dev) => (
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
                    <button onClick={() => handleRemoveBookmark(dev._id)}>
                      <XCircle className="w-4 h-4 text-red-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  <p className="text-slate-555 leading-relaxed line-clamp-2">
                    {dev.bio || 'Product builder exploring internships and project scopes.'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t">
                    <div className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-bold text-slate-700">{dev.reputation || 0} REP</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-650 px-2 py-0.5 rounded font-black text-[9px] uppercase">{dev.availabilityStatus || 'available'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  <button
                    onClick={() => navigate(`/recruiter/developers/${dev._id}`)}
                    className="py-2 border rounded-xl hover:bg-slate-50 font-bold text-center flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => setSelectedDevForMessage(dev)}
                    className="py-2 border rounded-xl hover:bg-slate-50 font-bold text-center flex items-center justify-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Message</span>
                  </button>
                  <button
                    onClick={() => setSelectedDevForShortlist(dev)}
                    className="py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 font-bold text-center"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => setSelectedDevForInterview(dev)}
                    className="py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-center"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL WINDOWS (PROFILE, MESSAGE, SHORTLIST, INTERVIEW) */}
        {/* Profile overlay */}
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
                <div className="space-y-2">
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Bio</span>
                    <p className="text-slate-655 leading-relaxed italic">"{selectedDevForProfile.bio || 'No bio specified.'}"</p>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase mb-1">Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDevForProfile.skills?.map((s, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[9px]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t text-right">
                  <button onClick={() => setSelectedDevForProfile(null)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Close</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Message overlay */}
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
                </div>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <textarea rows={4} required placeholder="Message content..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-3 focus:outline-none" />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setSelectedDevForMessage(null)} className="w-1/2 py-2 border rounded-xl text-slate-500 font-bold">Cancel</button>
                    <button type="submit" disabled={submittingMsg} className="w-1/2 py-2 bg-brand-primary text-white rounded-xl font-bold shadow">{submittingMsg ? 'Sending...' : 'Send Message'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Shortlist overlay */}
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
                </div>
                <form onSubmit={handleShortlist} className="space-y-4">
                  <select value={shortlistStage} onChange={(e) => setShortlistStage(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-2.5 focus:outline-none">
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <textarea rows={2} placeholder="Notes..." value={shortlistNotes} onChange={(e) => setShortlistNotes(e.target.value)} className="bg-slate-50 border rounded-xl w-full p-3 focus:outline-none" />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setSelectedDevForShortlist(null)} className="w-1/2 py-2 border rounded-xl text-slate-550 font-bold">Cancel</button>
                    <button type="submit" disabled={submittingShortlist} className="w-1/2 py-2 bg-indigo-650 text-white rounded-xl font-bold shadow">Confirm</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Interview scheduler */}
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
                </div>
                <form onSubmit={handleScheduleInterview} className="space-y-3">
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
                    <button type="button" onClick={() => setSelectedDevForInterview(null)} className="w-1/2 py-2 border rounded-xl text-slate-500 font-bold">Cancel</button>
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

export default RecruiterSaved;
