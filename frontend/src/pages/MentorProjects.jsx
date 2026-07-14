import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Users,
  CheckSquare,
  Video,
  Activity,
  FileText,
  Megaphone,
  Download,
  Code,
  MessageSquare,
  ClipboardCheck,
  BarChart,
  Calendar,
  AlertCircle,
  Clock,
  Award,
  Globe,
  Plus
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

const MentorProjects = () => {
  const { socket } = useSocket();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Workspace selection states
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeProjData, setActiveProjData] = useState(null);
  const [projectTab, setProjectTab] = useState('overview');

  // Workspace sub-data states
  const [projTasks, setProjTasks] = useState([]);
  const [projFiles, setProjFiles] = useState([]);
  const [projNotes, setProjNotes] = useState([]);
  const [projAnnouncements, setProjAnnouncements] = useState([]);
  const [projTimeline, setProjTimeline] = useState([]);
  const [projMeetings, setProjMeetings] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingProject, setLoadingProject] = useState(false);

  // Chat message state
  const [chatInput, setChatInput] = useState('');

  // Meeting scheduler states
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetUrlLink, setMeetUrlLink] = useState('');
  const [schedulingMeet, setSchedulingMeet] = useState(false);

  // Meeting logs resolution
  const [selectedMeetingLogs, setSelectedMeetingLogs] = useState(null);
  const [logNotes, setLogNotes] = useState('');
  const [logStatus, setLogStatus] = useState('Completed');
  const [logAttendance, setLogAttendance] = useState([]);
  const [savingLogs, setSavingLogs] = useState(false);

  // Student Profile overlay state
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Project completion review states
  const [completionFeedback, setCompletionFeedback] = useState('');
  const [resolvingCompletion, setResolvingCompletion] = useState(false);

  const chatBottomRef = useRef(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor/projects');
      if (res.data.status === 'success') {
        setProjects(res.data.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load mentored projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchProjects();
    };
    socket.on('notification_received', handleRefresh);
    return () => {
      socket.off('notification_received', handleRefresh);
    };
  }, [socket]);

  const loadProjectWorkspace = async (project) => {
    setLoadingProject(true);
    setSelectedProjectId(project._id);
    setActiveProjData(project);
    setProjectTab('overview');
    try {
      // Fetch meetings list
      const meetRes = await api.get(`/mentor/projects/${project._id}/meetings`);
      if (meetRes.data.status === 'success') {
        setProjMeetings(meetRes.data.data.meetings || []);
      }

      // Fetch team details
      if (project.team) {
        const teamRes = await api.get(`/teams/${project.team}`);
        if (teamRes.data.status === 'success') {
          const t = teamRes.data.data.team;
          setProjTasks(t.tasks || []);
          setProjFiles(t.files || []);
          setProjNotes(t.notes || []);
          setProjAnnouncements(t.announcements || []);
          setProjTimeline(t.activityLogs || []);
        }
      }
    } catch (err) {
      console.error('Failed to load project details:', err.message);
    } finally {
      setLoadingProject(false);
    }
  };

  // Socket huddle chat room listener
  useEffect(() => {
    if (!socket || !selectedProjectId || !activeProjData?.team) return;
    
    socket.emit('join_project_room', { projectId: activeProjData.team });

    socket.on('chat_received', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_received');
    };
  }, [socket, selectedProjectId, activeProjData]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !activeProjData?.team) return;

    socket.emit('send_chat', {
      projectId: activeProjData.team,
      text: chatInput,
      senderId: socket.userId
    });
    setChatInput('');
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!meetTitle.trim() || !meetDate) return;

    setSchedulingMeet(true);
    try {
      const res = await api.post('/mentor/meetings', {
        projectId: selectedProjectId,
        title: meetTitle,
        description: meetDesc,
        dateTime: meetDate,
        meetLink: meetUrlLink
      });

      if (res.data.status === 'success') {
        alert('Meeting successfully scheduled and team notified!');
        setMeetTitle('');
        setMeetDesc('');
        setMeetDate('');
        setMeetUrlLink('');

        const meetRes = await api.get(`/mentor/projects/${selectedProjectId}/meetings`);
        if (meetRes.data.status === 'success') {
          setProjMeetings(meetRes.data.data.meetings || []);
        }
      }
    } catch (err) {
      alert('Failed to schedule meeting.');
    } finally {
      setSchedulingMeet(false);
    }
  };

  const handleUpdateMeetingLogs = async (e) => {
    e.preventDefault();
    if (!selectedMeetingLogs) return;

    setSavingLogs(true);
    try {
      const res = await api.put(`/mentor/meetings/${selectedMeetingLogs._id}`, {
        status: logStatus,
        notes: logNotes,
        attendance: logAttendance
      });

      if (res.data.status === 'success') {
        alert('Meeting logs and attendance records saved successfully.');
        setSelectedMeetingLogs(null);
        setLogNotes('');
        setLogAttendance([]);

        const meetRes = await api.get(`/mentor/projects/${selectedProjectId}/meetings`);
        if (meetRes.data.status === 'success') {
          setProjMeetings(meetRes.data.data.meetings || []);
        }
      }
    } catch (err) {
      alert('Failed to update meeting logs.');
    } finally {
      setSavingLogs(false);
    }
  };

  const handleResolveCompletion = async (action) => {
    if (!selectedProjectId) return;
    if (action === 'reject' && !completionFeedback.trim()) {
      alert('Please specify review feedback reasons before declining completion.');
      return;
    }

    setResolvingCompletion(true);
    try {
      const res = await api.post(`/mentor/projects/${selectedProjectId}/resolve-completion`, {
        action,
        feedback: completionFeedback
      });

      if (res.data.status === 'success') {
        alert(`Project completion resolve resolution set to ${action}!`);
        setCompletionFeedback('');
        fetchProjects();
        setSelectedProjectId(null);
        setActiveProjData(null);
      }
    } catch (err) {
      alert('Failed to resolve project completion.');
    } finally {
      setResolvingCompletion(false);
    }
  };

  const handleToggleAttendance = (userId) => {
    setLogAttendance(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing huddle project workspaces...
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
              Workspace Directory
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-505" />
              <span>Assigned Projects</span>
            </h2>
            <p className="text-xs text-slate-555">
              Access project huddle workspaces, view files, and audit task cards in read-only format.
            </p>
          </div>
          {selectedProjectId && (
            <button
              onClick={() => { setSelectedProjectId(null); setActiveProjData(null); }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              &larr; Return to directory
            </button>
          )}
        </div>

        {/* 1. PROJECTS DIRECTORY LIST */}
        {!selectedProjectId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <div className="md:col-span-2 p-12 border border-dashed rounded-3xl text-center text-slate-450 font-semibold">
                No assigned projects found. Accept incoming requests to join workspaces.
              </div>
            ) : (
              projects.map((p) => (
                <div key={p._id} className="rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-brand-primary/10 text-brand-primary border px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-slate-400">Team Size: {p.members?.length + 1 || 1} Members</span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-850">{p.title}</h4>
                    <p className="text-[11px] text-slate-555 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Owner: <strong className="text-slate-700">{p.owner?.name}</strong></span>
                      <span>Next Meeting: <strong className="text-indigo-650">{p.nextMeeting ? new Date(p.nextMeeting.dateTime).toLocaleDateString() : 'None Scheduled'}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => loadProjectWorkspace(p)}
                    className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-center hover:bg-slate-850 transition-colors"
                  >
                    Open Workspace
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. READ-ONLY HUDDLE WORKSPACE */}
        {selectedProjectId && activeProjData && (
          <div className="space-y-6">
            {/* Completion review banner */}
            {activeProjData.status === 'Pending Completion' && (
              <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-850">Project Completion Review</h4>
                    <p className="text-slate-555 text-[11px] mt-0.5 leading-relaxed">
                      The owner has submitted this project for final closure. Verify deliverables and analytics.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 max-w-xl">
                  <textarea
                    rows={2}
                    placeholder="Provide final feedback logs (required if declining completion)..."
                    value={completionFeedback}
                    onChange={(e) => setCompletionFeedback(e.target.value)}
                    className="bg-white border rounded-xl px-3 py-2 focus:outline-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolveCompletion('reject')}
                      disabled={resolvingCompletion}
                      className="px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-bold"
                    >
                      Decline Completion
                    </button>
                    <button
                      onClick={() => handleResolveCompletion('approve')}
                      disabled={resolvingCompletion}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:opacity-90 font-bold"
                    >
                      Approve & Close Project
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace tabs */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
              {[
                { id: 'overview', label: 'Overview', icon: Briefcase },
                { id: 'members', label: 'Team Members', icon: Users },
                { id: 'kanban', label: 'Kanban Board', icon: CheckSquare },
                { id: 'chat', label: 'Huddle Chat', icon: MessageSquare },
                { id: 'files', label: 'Shared Files', icon: FileText },
                { id: 'notes', label: 'Scratch Board', icon: Megaphone },
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                { id: 'commits', label: 'GitHub Commits', icon: Code },
                { id: 'timeline', label: 'Activity Timeline', icon: Activity },
                { id: 'meetings', label: 'Meetings Hub', icon: Video },
                { id: 'analytics', label: 'Analytics', icon: BarChart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProjectTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                      projectTab === tab.id
                        ? 'bg-slate-900 text-white border-transparent'
                        : 'bg-white text-slate-550 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {loadingProject ? (
              <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
                Syncing workspace details...
              </div>
            ) : (
              <div className="text-xs text-left">
                {/* overview */}
                {projectTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                          {activeProjData.category}
                        </span>
                        <h3 className="font-extrabold text-base mt-2">{activeProjData.title}</h3>
                      </div>
                      <p className="text-slate-655 leading-relaxed text-xs">{activeProjData.description}</p>
                    </div>

                    <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                      <h4 className="font-bold text-sm">Sprint Status</h4>
                      <div className="p-4 bg-slate-50 rounded-2xl border">
                        <span className="block text-slate-400 font-bold text-[9px] uppercase">Sprint Progress</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${projTasks.length > 0 ? Math.round((projTasks.filter(t => t.status === 'done' || t.status === 'Done').length / projTasks.length) * 100) : 0}%` }} />
                          </div>
                          <span className="font-bold font-mono">
                            {projTasks.length > 0 ? Math.round((projTasks.filter(t => t.status === 'done' || t.status === 'Done').length / projTasks.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* members */}
                {projectTab === 'members' && (
                  <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base">Huddle Members (Click to view Profile)</h3>
                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedStudent(activeProjData.owner)}
                        className="flex items-center justify-between p-3 border rounded-2xl bg-slate-50/20 hover:border-brand-primary/45 cursor-pointer transition-all text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <img src={getAvatarUrl(activeProjData.owner?.avatar)} alt="Owner" className="w-8 h-8 rounded-full border object-cover" />
                          <div>
                            <span className="block font-bold">{activeProjData.owner?.name}</span>
                            <span className="block text-[10px] text-slate-400">Project Owner</span>
                          </div>
                        </div>
                      </div>

                      {activeProjData.members?.map(m => (
                        <div
                          key={m.userId?._id}
                          onClick={() => setSelectedStudent(m.userId)}
                          className="flex items-center justify-between p-3 border rounded-2xl hover:border-brand-primary/45 cursor-pointer transition-all text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <img src={getAvatarUrl(m.userId?.avatar)} alt={m.userId?.name} className="w-8 h-8 rounded-full border object-cover" />
                            <div>
                              <span className="block font-bold">{m.userId?.name}</span>
                              <span className="block text-[10px] text-slate-400">Teammate</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 capitalize bg-slate-100 border px-3 py-1 rounded-full">{m.role || 'Member'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* kanban */}
                {projectTab === 'kanban' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Read-only Permissions: Mentors are restricted from editing task cards or dragging Kanban columns.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="rounded-3xl bg-slate-50 p-4 space-y-4">
                        <span className="block text-slate-450 font-bold uppercase">To Do</span>
                        <div className="space-y-3">
                          {projTasks.filter(t => t.status === 'todo' || t.status === 'To Do').map(task => (
                            <div key={task._id} className="p-4 border bg-white rounded-2xl shadow-sm space-y-1">
                              <h5 className="font-bold text-slate-800">{task.title}</h5>
                              <p className="text-[10px] text-slate-450">{task.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl bg-slate-50 p-4 space-y-4">
                        <span className="block text-slate-450 font-bold uppercase">In Progress</span>
                        <div className="space-y-3">
                          {projTasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').map(task => (
                            <div key={task._id} className="p-4 border bg-white rounded-2xl shadow-sm space-y-1">
                              <h5 className="font-bold text-slate-805">{task.title}</h5>
                              <p className="text-[10px] text-slate-455">{task.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl bg-slate-50 p-4 space-y-4">
                        <span className="block text-slate-450 font-bold uppercase">Done</span>
                        <div className="space-y-3">
                          {projTasks.filter(t => t.status === 'done' || t.status === 'Done').map(task => (
                            <div key={task._id} className="p-4 border bg-white rounded-2xl shadow-sm border-emerald-500/25 bg-emerald-50/5">
                              <h5 className="font-bold text-slate-805">{task.title}</h5>
                              <p className="text-[10px] text-slate-455">{task.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* chat */}
                {projectTab === 'chat' && (
                  <div className="rounded-3xl border bg-white overflow-hidden flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chatMessages.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 italic">No huddle chat history logged.</div>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <img src={getAvatarUrl(msg.sender?.avatar)} alt="Sender" className="w-6 h-6 rounded-full object-cover border" />
                            <div>
                              <span className="block text-[9px] font-bold text-slate-400">{msg.sender?.name}</span>
                              <div className="p-2 border bg-slate-50 rounded-xl mt-0.5">
                                <p>{msg.text}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatBottomRef} />
                    </div>
                    <form onSubmit={handleSendChat} className="p-4 border-t flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type huddle comment..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-slate-50 border rounded-xl px-4 py-2 focus:outline-none"
                      />
                      <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl">Send</button>
                    </form>
                  </div>
                )}

                {/* files */}
                {projectTab === 'files' && (
                  <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base">Shared Workspace Files</h3>

                    {projFiles.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 border border-dashed rounded-2xl">
                        No files shared in workspace.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projFiles.map(f => (
                          <div key={f._id} className="flex items-center justify-between p-3 border rounded-2xl bg-slate-50/30">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-7 h-7 text-brand-primary" />
                              <div>
                                <span className="block font-bold text-slate-800">{f.name || f.fileName}</span>
                                <span className="block text-[9px] text-slate-400">By: {f.uploadedBy?.name}</span>
                              </div>
                            </div>
                            <a href={getFileUrl(f.url || f.fileUrl)} download target="_blank" rel="noreferrer" className="p-2 border rounded-xl hover:bg-slate-50">
                              <Download className="w-4 h-4 text-slate-550" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* notes */}
                {projectTab === 'notes' && (
                  <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base">Scratch Board Notes</h3>

                    {projNotes.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 italic">No notes shared.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projNotes.map(n => (
                          <div key={n._id} className="p-4 border rounded-2xl bg-slate-50/20 space-y-2">
                            <p className="text-slate-655">{n.content}</p>
                            <span className="block text-[9px] text-slate-400 text-right">By: {n.authorId?.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* announcements */}
                {projectTab === 'announcements' && (
                  <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base">Announcements Board</h3>

                    {projAnnouncements.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 italic">No announcements published.</div>
                    ) : (
                      <div className="space-y-3">
                        {projAnnouncements.map(ann => (
                          <div key={ann._id} className={`p-4 border rounded-2xl ${ann.pinned ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white'}`}>
                            <p className="text-slate-700">{ann.content}</p>
                            <span className="block text-[9px] text-slate-400 mt-2 text-right font-mono">By: Creator</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* commits */}
                {projectTab === 'commits' && (
                  <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <Code className="w-5 h-5 mr-2 text-indigo-505" />
                      <span>Linked Github Commits</span>
                    </h3>

                    {!activeProjData.repoUrl ? (
                      <div className="p-8 border border-dashed rounded-2xl text-center text-slate-450">
                        No repository linked.
                      </div>
                    ) : (
                      <div className="space-y-2 font-mono text-[11px]">
                        <div className="p-3 border rounded-xl bg-slate-50 flex justify-between">
                          <span>#a9f23c: Refactored navigation models</span>
                          <span className="text-slate-400">1 hour ago</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* timeline */}
                {projectTab === 'timeline' && (
                  <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-indigo-505" />
                      <span>Activity Timeline</span>
                    </h3>

                    {projTimeline.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 italic">No activity logs recorded.</div>
                    ) : (
                      <div className="space-y-4">
                        {projTimeline.map((log, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-[11px]">
                            <img src={getAvatarUrl(log.actorId?.avatar)} alt="Actor" className="w-6 h-6 rounded-full object-cover border" />
                            <div>
                              <span className="font-bold text-slate-800">{log.actorId?.name}</span>
                              <span className="text-slate-550 ml-1.5">{log.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* meetings */}
                {projectTab === 'meetings' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Scheduler */}
                    <div className="lg:col-span-2 rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-base flex items-center">
                        <Video className="w-5 h-5 mr-2 text-red-500" />
                        <span>Schedule Meetings</span>
                      </h3>

                      <form onSubmit={handleScheduleMeeting} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <label className="font-bold text-slate-400">Meeting Title</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Milestone 1 Sprint review"
                              value={meetTitle}
                              onChange={(e) => setMeetTitle(e.target.value)}
                              className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="font-bold text-slate-400">Date & Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={meetDate}
                              onChange={(e) => setMeetDate(e.target.value)}
                              className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-400">Google Meet Link</label>
                          <input
                            type="url"
                            placeholder="https://meet.google.com/..."
                            value={meetUrlLink}
                            onChange={(e) => setMeetUrlLink(e.target.value)}
                            className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-400">Meeting Description</label>
                          <textarea
                            rows={2}
                            value={meetDesc}
                            onChange={(e) => setMeetDesc(e.target.value)}
                            className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                          />
                        </div>

                        <button type="submit" disabled={schedulingMeet} className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow">
                          {schedulingMeet ? 'Scheduling...' : 'Schedule & Notify Team'}
                        </button>
                      </form>
                    </div>

                    {/* History */}
                    <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                      <h4 className="font-bold text-sm">Meeting Logs History</h4>
                      {projMeetings.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 italic">No meetings scheduled.</div>
                      ) : (
                        <div className="space-y-3">
                          {projMeetings.map(m => (
                            <div key={m._id} className="p-3 border rounded-2xl bg-slate-50/20 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold">{m.title}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                  m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : m.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>{m.status}</span>
                              </div>
                              <span className="block text-[9px] text-slate-400 font-mono">{new Date(m.dateTime).toLocaleString()}</span>
                              {m.status === 'Scheduled' && (
                                <button
                                  onClick={() => { setSelectedMeetingLogs(m); setLogNotes(m.notes || ''); setLogStatus('Completed'); setLogAttendance(m.attendance || []); }}
                                  className="w-full py-1 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold rounded text-[9px]"
                                >
                                  Resolve Logs
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* analytics */}
                {projectTab === 'analytics' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-3xl border bg-white p-5 shadow-sm space-y-3">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Completion Percentage</span>
                      <span className="block text-2xl font-black text-brand-primary">
                        {projTasks.length > 0
                          ? `${Math.round((projTasks.filter(t => t.status === 'done' || t.status === 'Done').length / projTasks.length) * 100)}%`
                          : '0%'}
                      </span>
                    </div>

                    <div className="rounded-3xl border bg-white p-5 shadow-sm space-y-3">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Pending Reviews</span>
                      <span className="block text-2xl font-black text-amber-500">0 Reviews</span>
                    </div>

                    <div className="rounded-3xl border bg-white p-5 shadow-sm space-y-3">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Next Meeting scheduled</span>
                      <span className="block text-sm font-bold text-slate-700">
                        {projMeetings.filter(m => m.status === 'Scheduled').length > 0
                          ? new Date(projMeetings.filter(m => m.status === 'Scheduled')[0].dateTime).toLocaleDateString()
                          : 'None'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LOG RESOLVE MEETING MODAL */}
        {selectedMeetingLogs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedMeetingLogs(null)} />
            <div className="bg-white border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left text-xs">
              <div>
                <h3 className="font-extrabold text-base">Resolve meeting logs</h3>
                <p className="text-xs text-slate-450 mt-0.5">Meeting: {selectedMeetingLogs.title}</p>
              </div>

              <form onSubmit={handleUpdateMeetingLogs} className="space-y-4">
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
                        checked={logAttendance.includes(activeProjData.owner?._id)}
                        onChange={() => handleToggleAttendance(activeProjData.owner?._id)}
                        className="rounded"
                      />
                      <span>{activeProjData.owner?.name} (Owner)</span>
                    </label>
                    {activeProjData.members?.map(m => (
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
                  <button type="button" onClick={() => setSelectedMeetingLogs(null)} className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center">Cancel</button>
                  <button type="submit" disabled={savingLogs} className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2">{savingLogs ? 'Saving...' : 'Save logs'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STUDENT PROFILE DETAILS MODAL */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedStudent(null)} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-4 text-left text-xs overflow-y-auto max-h-[90vh]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getAvatarUrl(selectedStudent.avatar)}
                      alt={selectedStudent.name}
                      className="w-14 h-14 rounded-full border object-cover"
                    />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800">{selectedStudent.name}</h3>
                      <span className="block text-[10px] text-slate-400 font-mono">College: {selectedStudent.college || 'N/A'}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 border px-3 py-1 rounded-full font-bold text-[10px] flex items-center">
                    <Award className="w-3.5 h-3.5 mr-1" />
                    {selectedStudent.reputation || 0} REP
                  </span>
                </div>

                {selectedStudent.bio && (
                  <div className="space-y-1">
                    <span className="block text-slate-400 font-bold uppercase text-[9px]">Bio</span>
                    <p className="text-slate-655 leading-relaxed">{selectedStudent.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudent.skills?.length > 0 ? (
                        selectedStudent.skills.map((s, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[9px]">{s}</span>
                        ))
                      ) : (
                        <span className="text-slate-400">None declared.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-bold uppercase text-[9px]">GitHub / Socials</span>
                    <div className="space-y-1 mt-1">
                      {selectedStudent.socialLinks?.github ? (
                        <a href={selectedStudent.socialLinks.github} target="_blank" rel="noreferrer" className="text-brand-primary font-bold hover:underline flex items-center">
                          <Code className="w-3.5 h-3.5 mr-1" /> Github
                        </a>
                      ) : (
                        <span className="text-slate-400 block">No GitHub linked.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Tasks list */}
                <div className="space-y-2 pt-3 border-t">
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">Assigned Tasks in project</span>
                  <div className="space-y-1.5">
                    {projTasks.filter(t => t.assignedTo === selectedStudent._id || t.assignedTo?._id === selectedStudent._id).length === 0 ? (
                      <span className="text-slate-400 italic">No tasks assigned.</span>
                    ) : (
                      projTasks.filter(t => t.assignedTo === selectedStudent._id || t.assignedTo?._id === selectedStudent._id).map(t => (
                        <div key={t._id} className="p-2 border rounded-xl flex justify-between items-center bg-slate-50/50">
                          <span>{t.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            t.status === 'Done' || t.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{t.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent activity timeline */}
                <div className="space-y-2 pt-3 border-t">
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">Recent Project Activity</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {projTimeline.filter(log => log.actorId?._id === selectedStudent._id || log.actorId === selectedStudent._id).length === 0 ? (
                      <span className="text-slate-400 italic">No activity logs recorded.</span>
                    ) : (
                      projTimeline.filter(log => log.actorId?._id === selectedStudent._id || log.actorId === selectedStudent._id).map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b">
                          <span>{log.action}</span>
                          <span className="text-slate-400 font-mono text-[9px]">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t text-right">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MentorProjects;
