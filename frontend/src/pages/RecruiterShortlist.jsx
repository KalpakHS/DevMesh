import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  MessageSquare,
  Calendar,
  XCircle,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const RecruiterShortlist = () => {
  const navigate = useNavigate();
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState('Shortlisted'); // Shortlisted, Interview, Selected, Rejected

  // Modal control states
  const [selectedDevForProfile, setSelectedDevForProfile] = useState(null);
  const [selectedDevForMessage, setSelectedDevForMessage] = useState(null);
  const [selectedDevForInterview, setSelectedDevForInterview] = useState(null);

  // Form states
  const [messageContent, setMessageContent] = useState('');
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewDesc, setInterviewDesc] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewTimezone, setInterviewTimezone] = useState('GMT+5:30');
  const [interviewMode, setInterviewMode] = useState('Online');
  const [interviewMeetLink, setInterviewMeetLink] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');

  const [submittingMsg, setSubmittingMsg] = useState(false);
  const [submittingInterview, setSubmittingInterview] = useState(false);

  const fetchShortlists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/shortlists');
      if (res.data.status === 'success') {
        setShortlists(res.data.data.shortlists || []);
      }
    } catch (err) {
      console.error('Failed to load shortlists:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlists();
  }, []);

  const handleUpdateStage = async (developerId, stage) => {
    try {
      const res = await api.post(`/recruiter/shortlists/${developerId}`, { stage });
      if (res.data.status === 'success') {
        alert(`Candidate moved to ${stage}!`);
        fetchShortlists();
      }
    } catch (err) {
      alert('Failed to update pipeline stage.');
    }
  };

  const handleRemoveShortlist = async (developerId) => {
    if (!window.confirm('Are you sure you want to remove this candidate from shortlist?')) return;
    try {
      const res = await api.post(`/recruiter/shortlists/${developerId}`, { stage: 'remove' });
      if (res.data.status === 'success') {
        alert('Candidate removed from shortlist.');
        fetchShortlists();
      }
    } catch (err) {
      alert('Failed to remove candidate.');
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
          Syncing recruitment pipeline logs...
        </div>
      </Layout>
    );
  }

  // Filter list by stage
  const stageCandidates = shortlists.filter(item => item.stage === activeStage);

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-505 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Pipeline Workspace
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Shortlisted Candidates</span>
            </h2>
            <p className="text-xs text-slate-550">
              Track talent status updates across pipeline stages: Screening, Interviews, Offers, and Declines.
            </p>
          </div>
        </div>

        {/* Pipeline Stage Tabs */}
        <div className="flex space-x-1.5 pb-2 border-b">
          {[
            { id: 'Shortlisted', label: 'Shortlisted', count: shortlists.filter(i => i.stage === 'Shortlisted').length },
            { id: 'Interview', label: 'Interview Stage', count: shortlists.filter(i => i.stage === 'Interview').length },
            { id: 'Selected', label: 'Selected / Hired', count: shortlists.filter(i => i.stage === 'Selected').length },
            { id: 'Rejected', label: 'Rejected', count: shortlists.filter(i => i.stage === 'Rejected').length }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveStage(t.id)}
              className={`px-4 py-2.5 rounded-xl font-bold border transition-all ${
                activeStage === t.id
                  ? 'bg-slate-900 text-white border-transparent'
                  : 'bg-white text-slate-550 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Candidates List */}
        {stageCandidates.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 font-bold bg-white">
            No candidates are in the "{activeStage}" stage.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stageCandidates.map((item) => {
              const dev = item.developerId;
              if (!dev) return null;
              return (
                <div key={item._id} className="rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2.5">
                        <img src={getAvatarUrl(dev.avatar)} alt="Avatar" className="w-10 h-10 rounded-full border object-cover" />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800">{dev.name}</h4>
                          <span className="block text-[9px] text-slate-400">{dev.college || 'DevMesh Member'}</span>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveShortlist(dev._id)}>
                        <XCircle className="w-4.5 h-4.5 text-slate-400 hover:text-red-500 transition-colors" />
                      </button>
                    </div>

                    {item.notes && (
                      <div className="p-3 bg-slate-50 border rounded-2xl">
                        <span className="block text-[8px] text-slate-400 uppercase font-bold">Recruiter Notes</span>
                        <p className="text-slate-655 italic mt-0.5">"{item.notes}"</p>
                      </div>
                    )}

                    <div className="flex flex-col space-y-1">
                      <span className="block text-[8px] text-slate-400 uppercase font-bold">Move Stage</span>
                      <select
                        value={item.stage}
                        onChange={(e) => handleUpdateStage(dev._id, e.target.value)}
                        className="bg-slate-50 border rounded-xl px-2.5 py-1.5 focus:outline-none font-bold"
                      >
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/recruiter/developers/${dev._id}`)}
                      className="py-1.5 border rounded-lg hover:bg-slate-50 font-bold text-center flex items-center justify-center space-x-1.5 w-1/3 text-[10px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => setSelectedDevForMessage(dev)}
                      className="py-1.5 border rounded-lg hover:bg-slate-50 font-bold text-center flex items-center justify-center space-x-1.5 w-1/3 text-[10px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-550" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => setSelectedDevForInterview(dev)}
                      className="py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-center flex items-center justify-center space-x-1.5 w-1/3 text-[10px]"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Interview</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROFILE OVERLAY */}
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
                  <span className="block text-[8px] text-slate-400 font-bold uppercase">Bio</span>
                  <p className="text-slate-655 italic">"{selectedDevForProfile.bio || 'No bio specified.'}"</p>
                </div>
                <div className="pt-4 border-t text-right">
                  <button onClick={() => setSelectedDevForProfile(null)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Close</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MESSAGE OVERLAY */}
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

        {/* INTERVIEW SCHEDULER */}
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

export default RecruiterShortlist;
