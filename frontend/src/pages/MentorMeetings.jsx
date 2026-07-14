import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Plus
} from 'lucide-react';

const MentorMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scheduling state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Edit / Resolve Meeting Log state
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [logNotes, setLogNotes] = useState('');
  const [logStatus, setLogStatus] = useState('Completed');
  const [logAttendance, setLogAttendance] = useState([]);
  const [savingLogs, setSavingLogs] = useState(false);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor/meetings');
      if (res.data.status === 'success') {
        setMeetings(res.data.data.meetings || []);
      }
    } catch (err) {
      console.error('Failed to fetch meetings list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/mentor/projects');
      if (res.data.status === 'success') {
        const projs = res.data.data.projects || [];
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects list:', err.message);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchProjects();
  }, []);

  const handleGenerateMeetLink = () => {
    const randomId = Math.random().toString(36).substring(2, 12);
    setMeetLink(`https://meet.google.com/abc-${randomId.substring(0,4)}-${randomId.substring(4,7)}`);
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date || !time || !selectedProjectId) return;

    setScheduling(true);
    // Combine date and time
    const dateTimeStr = `${date}T${time}`;
    try {
      const res = await api.post('/mentor/meetings', {
        projectId: selectedProjectId,
        title,
        description,
        dateTime: dateTimeStr,
        meetLink
      });

      if (res.data.status === 'success') {
        alert('Meeting scheduled and team notifications sent!');
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setMeetLink('');
        fetchMeetings();
      }
    } catch (err) {
      alert('Failed to schedule meeting.');
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      const res = await api.put(`/mentor/meetings/${meetingId}`, {
        status: 'Cancelled'
      });
      if (res.data.status === 'success') {
        alert('Meeting cancelled successfully.');
        fetchMeetings();
      }
    } catch (err) {
      alert('Failed to cancel meeting.');
    }
  };

  const handleSaveMeetingLogs = async (e) => {
    e.preventDefault();
    if (!editingMeeting) return;

    setSavingLogs(true);
    try {
      const res = await api.put(`/mentor/meetings/${editingMeeting._id}`, {
        status: logStatus,
        notes: logNotes,
        attendance: logAttendance
      });

      if (res.data.status === 'success') {
        alert('Meeting logs and attendance records saved successfully.');
        setEditingMeeting(null);
        setLogNotes('');
        setLogAttendance([]);
        fetchMeetings();
      }
    } catch (err) {
      alert('Failed to save meeting logs.');
    } finally {
      setSavingLogs(false);
    }
  };

  const handleToggleAttendance = (userId) => {
    setLogAttendance(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const openLogResolver = (m) => {
    setEditingMeeting(m);
    setLogNotes(m.notes || '');
    setLogStatus(m.status || 'Completed');
    setLogAttendance(m.attendance || []);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing huddle meetings directory...
        </div>
      </Layout>
    );
  }

  // Find active project metadata for selected log editing
  const editingProject = projects.find(p => p._id === editingMeeting?.projectId?._id);

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-850 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Huddle Scheduler
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Video className="w-5 h-5 mr-2 text-red-500" />
              <span>Meetings Manager</span>
            </h2>
            <p className="text-xs text-slate-550">
              Initiate project huddle sessions, generate Google Meet links, and logs student attendance logs.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 font-semibold">
            No projects assigned to schedule meetings.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Schedule Form */}
            <div className="lg:col-span-2 rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base">Schedule New Session</h3>

              <form onSubmit={handleScheduleMeeting} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-455">Select Project</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                    >
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-455">Meeting Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Milestone 1 Sprint review"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-455">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-455">Time</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-455">Google Meet link</label>
                    <button
                      type="button"
                      onClick={handleGenerateMeetLink}
                      className="text-[10px] text-brand-primary font-bold hover:underline"
                    >
                      Generate link
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-455">Description / Agenda</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <button type="submit" disabled={scheduling} className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow">
                  {scheduling ? 'Scheduling meeting...' : 'Schedule & Notify Team'}
                </button>
              </form>
            </div>

            {/* Right: History */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Huddle history</span>
              </h3>

              {meetings.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No meetings scheduled.</div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {meetings.map((m) => (
                    <div key={m._id} className="p-3.5 border rounded-2xl bg-slate-50/20 text-left space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{m.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : m.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {m.status}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500">{m.projectId?.title}</p>
                      
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span>{new Date(m.dateTime).toLocaleDateString()} at {new Date(m.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {m.meetLink && (
                          <a href={m.meetLink} target="_blank" rel="noreferrer" className="text-brand-primary font-bold hover:underline">
                            Meet Link
                          </a>
                        )}
                      </div>

                      {m.status === 'Scheduled' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleCancelMeeting(m._id)}
                            className="py-1 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-[9px] font-bold text-center"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => openLogResolver(m)}
                            className="py-1 bg-brand-primary text-white rounded-lg hover:opacity-90 text-[9px] font-bold text-center"
                          >
                            Resolve Logs
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOG RESOLVE MEETING MODAL */}
        {editingMeeting && editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setEditingMeeting(null)} />
            <div className="bg-white border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left text-xs">
              <div>
                <h3 className="font-extrabold text-base">Resolve meeting logs</h3>
                <p className="text-xs text-slate-450 mt-0.5">Meeting: {editingMeeting.title}</p>
              </div>

              <form onSubmit={handleSaveMeetingLogs} className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-450">Meeting Status</label>
                  <select
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value)}
                    className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-450">Log Attendance</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border p-2.5 rounded-xl">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={logAttendance.includes(editingProject.owner?._id)}
                        onChange={() => handleToggleAttendance(editingProject.owner?._id)}
                        className="rounded"
                      />
                      <span>{editingProject.owner?.name} (Owner)</span>
                    </label>
                    {editingProject.members?.map(m => (
                      <label key={m.userId?._id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={logAttendance.includes(m.userId?._id)}
                          onChange={() => handleToggleAttendance(m.userId?._id)}
                          className="rounded"
                        />
                        <span>{m.userId?.name} ({m.role || 'Member'})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-450">Meeting Notes / Minutes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide notes..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button type="button" onClick={() => setEditingMeeting(null)} className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center">Cancel</button>
                  <button type="submit" disabled={savingLogs} className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2">{savingLogs ? 'Saving...' : 'Save logs'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MentorMeetings;
