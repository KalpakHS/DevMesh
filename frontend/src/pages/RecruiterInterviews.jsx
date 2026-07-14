import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus,
  AlertCircle
} from 'lucide-react';

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reschedule & Feedback Modal States
  const [selectedIvForReschedule, setSelectedIvForReschedule] = useState(null);
  const [selectedIvForComplete, setSelectedIvForComplete] = useState(null);

  // Reschedule Date & Time
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Complete Feedback & Notes
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [sentReminders, setSentReminders] = useState([]);

  const handleSendReminder = (id) => {
    setSentReminders(prev => [...prev, id]);
    alert('Interview reminder successfully dispatched to developer!');
  };

  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/interviews');
      if (res.data.status === 'success') {
        setInterviews(res.data.data.interviews || []);
      }
    } catch (err) {
      console.error('Failed to load recruiter interviews:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    try {
      const res = await api.put(`/recruiter/interviews/${interviewId}`, { status: 'Cancelled' });
      if (res.data.status === 'success') {
        alert('Interview successfully cancelled.');
        fetchInterviews();
      }
    } catch (err) {
      alert('Failed to cancel interview.');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedIvForReschedule) return;

    const fullDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);
    if (isNaN(fullDateTime.getTime())) {
      alert('Specify a valid date and time.');
      return;
    }

    setSubmittingReschedule(true);
    try {
      const res = await api.put(`/recruiter/interviews/${selectedIvForReschedule._id}`, {
        dateTime: fullDateTime.toISOString(),
        status: 'Rescheduled'
      });
      if (res.data.status === 'success') {
        alert('Interview successfully rescheduled!');
        setSelectedIvForReschedule(null);
        setRescheduleDate('');
        setRescheduleTime('');
        fetchInterviews();
      }
    } catch (err) {
      alert('Failed to reschedule interview.');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!selectedIvForComplete) return;

    setSubmittingComplete(true);
    try {
      const res = await api.put(`/recruiter/interviews/${selectedIvForComplete._id}`, {
        status: 'Completed',
        feedback: feedbackNotes
      });
      if (res.data.status === 'success') {
        alert('Interview status updated to Completed!');
        setSelectedIvForComplete(null);
        setFeedbackNotes('');
        fetchInterviews();
      }
    } catch (err) {
      alert('Failed to complete interview.');
    } finally {
      setSubmittingComplete(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing interviews directory...
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
              Interview Center
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Interview Management</span>
            </h2>
            <p className="text-xs text-slate-550">
              Manage technical screenings, record post-interview evaluations, or reschedule sessions.
            </p>
          </div>
        </div>

        {/* Interviews Cards Grid */}
        {interviews.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 font-bold bg-white">
            No interviews scheduled. Head to Search Developers to schedule screenings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((iv) => (
              <div key={iv._id} className="rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      iv.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : iv.status === 'Cancelled'
                        ? 'bg-red-50 text-red-650 border border-red-100'
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    }`}>
                      {iv.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Mode: {iv.mode}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">{iv.title}</h4>
                    <span className="block text-[10px] text-slate-450 mt-0.5">Candidate: {iv.developerId?.name}</span>
                  </div>

                  {iv.description && (
                    <p className="text-slate-555 leading-relaxed italic">"{iv.description}"</p>
                  )}

                  {/* Visual Status Pipeline */}
                  <div className="py-2 flex items-center justify-between w-full relative pt-4 border-t border-slate-100">
                    <div className="absolute left-1 right-1 h-0.5 bg-slate-100 top-1/2 -translate-y-1/2 z-0" />
                    {[
                      { label: 'Scheduled', active: iv.status === 'Scheduled' || iv.status === 'Rescheduled' || iv.status === 'Completed' },
                      { label: 'Reminder Sent', active: iv.status === 'Completed' || sentReminders.includes(iv._id) },
                      { label: 'Completed', active: iv.status === 'Completed' },
                      { label: 'Feedback', active: iv.status === 'Completed' && iv.feedback },
                      { label: 'Decision', active: iv.status === 'Completed' && iv.feedback }
                    ].map((step, sIdx) => (
                      <div key={sIdx} className="z-10 flex flex-col items-center space-y-1">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold ${
                          step.active ? 'bg-indigo-650 text-white border-transparent' : 'bg-white text-slate-450 border-slate-200'
                        }`}>
                          {sIdx + 1}
                        </div>
                        <span className={`text-[7px] font-extrabold ${step.active ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 pt-3 border-t border-slate-100">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[8px]">Date & Time</span>
                      <span className="font-semibold text-slate-700">{new Date(iv.dateTime).toLocaleDateString()} at {new Date(iv.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[8px]">Link / Location</span>
                      {iv.mode === 'Online' && iv.meetLink ? (
                        <a
                          href={iv.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-650 font-bold flex items-center hover:underline mt-0.5"
                        >
                          <Video className="w-3.5 h-3.5 mr-1" />
                          <span>Google Meet</span>
                        </a>
                      ) : (
                        <span className="font-semibold text-slate-700 block truncate">{iv.location || 'N/A'}</span>
                      )}
                    </div>
                  </div>

                  {/* Feedback display */}
                  {iv.status === 'Completed' && iv.feedback && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <span className="block text-[8px] text-emerald-500 font-bold uppercase">Feedback notes</span>
                      <p className="text-emerald-700 italic mt-0.5">"{iv.feedback}"</p>
                    </div>
                  )}
                </div>

                {iv.status === 'Scheduled' && (
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleCancelInterview(iv._id)}
                      className="py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-bold text-center text-[9px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setSelectedIvForReschedule(iv); setRescheduleDate(''); setRescheduleTime(''); }}
                      className="py-1.5 border rounded-lg hover:bg-slate-550 hover:text-white font-bold text-center text-[9px]"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleSendReminder(iv._id)}
                      className="py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold text-center text-[9px]"
                    >
                      Reminder
                    </button>
                    <button
                      onClick={() => { setSelectedIvForComplete(iv); setFeedbackNotes(''); }}
                      className="py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-center text-[9px]"
                    >
                      Complete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* RESCHEDULE MODAL */}
        <AnimatePresence>
          {selectedIvForReschedule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setSelectedIvForReschedule(null)} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Reschedule Interview</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Interview: {selectedIvForReschedule.title}</p>
                </div>

                <form onSubmit={handleReschedule} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-450">New Date</label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="bg-slate-50 border rounded-xl p-2.5 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-bold text-slate-455">New Time</label>
                      <input
                        type="time"
                        required
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="bg-slate-50 border rounded-xl p-2.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIvForReschedule(null)}
                      className="w-1/2 py-2 border rounded-xl text-slate-550 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReschedule}
                      className="w-1/2 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow"
                    >
                      {submittingReschedule ? 'Rescheduling...' : 'Reschedule'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* COMPLETE FEEDBACK MODAL */}
        <AnimatePresence>
          {selectedIvForComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setSelectedIvForComplete(null)} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Complete Interview</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Submit evaluation feedback for candidate:</p>
                </div>

                <form onSubmit={handleComplete} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Feedback Notes / Rating Comments</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Add candidate evaluation details..."
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 w-full focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIvForComplete(null)}
                      className="w-1/2 py-2 border rounded-xl text-slate-550 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingComplete}
                      className="w-1/2 py-2 bg-slate-900 text-white rounded-xl font-bold shadow"
                    >
                      {submittingComplete ? 'Completing...' : 'Submit Complete'}
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

export default RecruiterInterviews;
