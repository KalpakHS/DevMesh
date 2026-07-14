import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  MessageSquare,
  FileText,
  Megaphone,
  Users,
  Video,
  Code,
  Activity,
  Plus,
  Send,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  Shield,
  Trash2,
  UserPlus,
  UserX,
  TrendingUp,
  BarChart,
  Calendar,
  Layers,
  Sparkles,
  Inbox,
  UserCheck,
  Search,
  ExternalLink,
  ClipboardList
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

const TeamWorkspace = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  // Core workspace state
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('kanban'); // kanban, directory, chat, documents, feed, notes, admin

  // Sub-tabs for Owner Panel
  const [adminSubTab, setAdminSubTab] = useState('analytics'); // analytics, edit-project, applicants, members, mentors

  // Kanban tasks states
  const [tasks, setTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskLabels, setNewTaskLabels] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatBottomRef = useRef(null);

  // Files upload states
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPinned, setNewAnnPinned] = useState(false);
  const [postingAnn, setPostingAnn] = useState(false);

  // Google Meet state
  const [meetUrl, setMeetUrl] = useState('');
  const [savingMeet, setSavingMeet] = useState(false);

  // Timeline / Activity logs state
  const [activityLogs, setActivityLogs] = useState([]);
  const [repEvents, setRepEvents] = useState([]);

  // Mock GitHub Commits list parsed from repoUrl
  const [githubCommits, setGithubCommits] = useState([]);

  // Milestone submission state
  const [showSubmitMilestoneModal, setShowSubmitMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneLink, setMilestoneLink] = useState('');
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [milestoneLoading, setMilestoneLoading] = useState(false);

  // --- PROJECT OWNER EXCLUSIVE STATES ---
  // 1. Edit Project form
  const [incomingMentorApps, setIncomingMentorApps] = useState([]);
  const [fetchingMentorApps, setFetchingMentorApps] = useState(false);
  const [rejectingAppId, setRejectingAppId] = useState('');
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [previewingMentorProfile, setPreviewingMentorProfile] = useState(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projSkills, setProjSkills] = useState('');
  const [projOpenings, setProjOpenings] = useState(1);
  const [projExp, setProjExp] = useState('Intermediate');
  const [projDuration, setProjDuration] = useState('1 Month');
  const [projDeadline, setProjDeadline] = useState('');
  const [projVisibility, setProjVisibility] = useState('public');
  const [projDifficulty, setProjDifficulty] = useState('intermediate');
  const [projWorkMode, setProjWorkMode] = useState('remote');
  const [updatingProj, setUpdatingProj] = useState(false);

  // 2. Applicant management
  const [applicants, setApplicants] = useState([]);
  const [fetchingApplicants, setFetchingApplicants] = useState(false);
  
  // Developer invite state
  const [searchDevQuery, setSearchDevQuery] = useState('');
  const [developersList, setDevelopersList] = useState([]);
  const [selectedDevForInvite, setSelectedDevForInvite] = useState(null);
  const [inviteRoleName, setInviteRoleName] = useState('Member');
  const [inviteMsgText, setInviteMsgText] = useState('');
  const [invitingDev, setInvitingDev] = useState(false);

  // Direct Team add
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('Member');
  const [addingMember, setAddingMember] = useState(false);

  // 3. Mentor Request System
  const [mentorSearch, setMentorSearch] = useState('');
  const [mentorExpertise, setMentorExpertise] = useState('');
  const [mentorsList, setMentorsList] = useState([]);
  const [fetchingMentors, setFetchingMentors] = useState(false);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [showMentorMsgModal, setShowMentorMsgModal] = useState(false);
  const [selectedMentorForReq, setSelectedMentorForReq] = useState(null);
  const [mentorReqMsg, setMentorReqMsg] = useState('');
  const [sendingMentorReq, setSendingMentorReq] = useState(false);

  const isOwner = team?.owner?._id === user?._id || team?.owner === user?._id || team?.project?.owner === user?._id;

  // Fetch workspace details
  const fetchWorkspaceDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/teams/${id}`);
      if (res.data.status === 'success') {
        const teamData = res.data.data.team;
        setTeam(teamData);
        setTasks(teamData.tasks || []);
        setFiles(teamData.files || []);
        setNotes(teamData.notes || []);
        setAnnouncements(teamData.announcements || []);
        setActivityLogs(teamData.activityLogs || []);
        setRepEvents(teamData.repEvents || []);
        setMeetUrl(teamData.project?.meetingUrl || '');

        // Populate edit project state
        if (teamData.project) {
          setProjTitle(teamData.project.title || '');
          setProjDesc(teamData.project.description || '');
          setProjCategory(teamData.project.category || '');
          setProjSkills(teamData.project.skills?.join(', ') || '');
          setProjOpenings(teamData.project.numOpenings || 1);
          setProjExp(teamData.project.experienceLevel || 'Intermediate');
          setProjDuration(teamData.project.duration || '1 Month');
          setProjDeadline(teamData.project.deadline ? teamData.project.deadline.split('T')[0] : '');
          setProjVisibility(teamData.project.visibility || 'public');
          setProjDifficulty(teamData.project.difficulty || 'intermediate');
          setProjWorkMode(teamData.project.workMode || 'remote');
        }

        // Seed commits if repository linked
        if (teamData.project?.repoUrl) {
          setGithubCommits([
            { id: 'a9f23c', msg: 'Updated Kanban state (#resolve)', author: user?.name, date: '1 hour ago' },
            { id: 'e1d882', msg: 'Configured Socket telemetry (#done)', author: 'Reddy', date: 'Yesterday' }
          ]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchWorkspaceDetails();
    }
  }, [id]);

  // Load Admin/Owner tabs details
  useEffect(() => {
    if (isOwner && activeTab === 'admin') {
      if (adminSubTab === 'applicants') {
        fetchApplicants();
      } else if (adminSubTab === 'mentors') {
        fetchMentors();
        fetchMentorRequestsLogs();
        fetchIncomingMentorApplications();
      }
    }
  }, [activeTab, adminSubTab, isOwner]);

  const fetchApplicants = async () => {
    if (!team?.project?._id) return;
    setFetchingApplicants(true);
    try {
      const res = await api.get(`/projects/${team.project._id}/applications`);
      if (res.data.status === 'success') {
        setApplicants(res.data.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err.message);
    } finally {
      setFetchingApplicants(false);
    }
  };

  const fetchMentors = async () => {
    setFetchingMentors(true);
    try {
      const queryParams = new URLSearchParams();
      if (mentorSearch) queryParams.append('search', mentorSearch);
      if (mentorExpertise) queryParams.append('expertise', mentorExpertise);

      const res = await api.get(`/mentor-requests/mentors?${queryParams.toString()}`);
      if (res.data.status === 'success') {
        setMentorsList(res.data.data.mentors || []);
      }
    } catch (err) {
      console.error('Failed to load mentors:', err.message);
    } finally {
      setFetchingMentors(false);
    }
  };

  const fetchMentorRequestsLogs = async () => {
    if (!team?.project?._id) return;
    try {
      const res = await api.get(`/mentor-requests/project/${team.project._id}`);
      if (res.data.status === 'success') {
        setMentorRequests(res.data.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load mentor requests:', err.message);
    }
  };

  const fetchIncomingMentorApplications = async () => {
    if (!team?.project?._id) return;
    setFetchingMentorApps(true);
    try {
      const res = await api.get(`/mentor/projects/${team.project._id}/applications`);
      if (res.data.status === 'success') {
        setIncomingMentorApps(res.data.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load incoming mentor applications:', err.message);
    } finally {
      setFetchingMentorApps(false);
    }
  };

  const handleResolveMentorApplication = async (applicationId, status, rejectionReason = '') => {
    try {
      const res = await api.put(`/mentor/applications/${applicationId}/resolve`, { status, rejectionReason });
      if (res.data.status === 'success') {
        alert(`Application successfully ${status}!`);
        fetchIncomingMentorApplications();
        if (status === 'Accepted') {
          fetchWorkspaceDetails();
        }
      }
    } catch (err) {
      alert('Failed to resolve mentor application.');
    }
  };

  const searchDevelopersToInvite = async (query) => {
    setSearchDevQuery(query);
    if (!query.trim()) return;
    try {
      const res = await api.get(`/users/search?skills=${query}`);
      if (res.data.status === 'success') {
        setDevelopersList(res.data.data.users || []);
      }
    } catch (err) {
      console.error('Failed to search developers:', err.message);
    }
  };

  // Socket chat connections
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_project_room', { projectId: team?.project?._id || id });

    socket.on('chat_received', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('activity_logged', (act) => {
      setActivityLogs((prev) => [act, ...prev]);
    });

    return () => {
      socket.off('chat_received');
      socket.off('activity_logged');
    };
  }, [socket, id, team]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Tasks actions
  const handleMoveTask = async (taskId, currentStatus) => {
    const nextMap = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' };
    const nextStatus = nextMap[currentStatus.toLowerCase()] || 'todo';
    
    try {
      const res = await api.put(`/teams/${id}/tasks/${taskId}`, { status: nextStatus });
      if (res.data.status === 'success') {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
      }
    } catch (err) {
      alert('Failed to update task state.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    setTaskLoading(true);
    try {
      const res = await api.post(`/teams/${id}/tasks`, {
        title: newTaskTitle,
        description: newTaskDesc,
        assignedTo: newTaskAssignee || null,
        priority: newTaskPriority,
        labels: newTaskLabels.split(',').map(l => l.trim()).filter(l => l.length > 0)
      });

      if (res.data.status === 'success') {
        setTasks(prev => [...prev, res.data.data.task]);
        setShowAddTaskModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskAssignee('');
        setNewTaskPriority('Medium');
        setNewTaskLabels('');
      }
    } catch (err) {
      alert('Failed to add task.');
    } finally {
      setTaskLoading(false);
    }
  };

  // Milestone submission
  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    setMilestoneLoading(true);
    try {
      const contentText = `[Milestone Submission]
Title: ${milestoneTitle}
Demo/Repo URL: ${milestoneLink || 'None'}
Progress Notes: ${milestoneNotes}`;

      const res = await api.post(`/teams/${id}/announcements`, {
        content: contentText,
        pinned: true
      });

      if (res.data.status === 'success') {
        setAnnouncements(prev => [res.data.data.announcement, ...prev]);
        setShowSubmitMilestoneModal(false);
        setMilestoneTitle('');
        setMilestoneLink('');
        setMilestoneNotes('');
        alert('Milestone successfully submitted to mentor review!');
      }
    } catch (err) {
      alert('Failed to submit milestone.');
    } finally {
      setMilestoneLoading(false);
    }
  };

  // Announcements publishing
  const handleAddAnn = async (e) => {
    e.preventDefault();
    if (!newAnnContent.trim()) return;

    setPostingAnn(true);
    try {
      const res = await api.post(`/teams/${id}/announcements`, { content: newAnnContent, pinned: newAnnPinned });
      if (res.data.status === 'success') {
        setAnnouncements(prev => [res.data.data.announcement, ...prev]);
        setNewAnnContent('');
        setNewAnnPinned(false);
      }
    } catch (err) {
      alert('Failed to post announcement.');
    } finally {
      setPostingAnn(false);
    }
  };

  // Chat message sending
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const chatPayload = {
      projectId: team?.project?._id,
      text: newMessage,
      sender: {
        _id: user?._id || user?.id,
        name: user?.name,
        avatar: user?.avatar
      },
      createdAt: new Date()
    };

    socket.emit('send_chat', chatPayload);
    setChatMessages((prev) => [...prev, chatPayload]);
    setNewMessage('');
  };

  // Save Meet Link
  const handleSaveMeet = async () => {
    if (!team?.project?._id) return;
    setSavingMeet(true);
    try {
      await api.put(`/projects/${team.project._id}`, { meetingUrl: meetUrl });
      alert('Google Meet link saved successfully!');
    } catch (err) {
      alert('Failed to save meeting link.');
    } finally {
      setSavingMeet(false);
    }
  };

  // File uploading
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await api.post(`/teams/${id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        setFiles(prev => [...prev, res.data.data.file]);
        setUploadFile(null);
      }
    } catch (err) {
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  // --- PROJECT OWNER EXCLUSIVE HANDLERS ---
  
  // 1. Edit Project details
  const handleUpdateProjectSpecs = async (statusOverride = null) => {
    if (!team?.project?._id) return;
    setUpdatingProj(true);

    const payload = {
      title: projTitle,
      description: projDesc,
      category: projCategory,
      numOpenings: projOpenings,
      experienceLevel: projExp,
      duration: projDuration,
      deadline: projDeadline || null,
      visibility: projVisibility,
      difficulty: projDifficulty,
      workMode: projWorkMode,
      skills: projSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };

    if (statusOverride) {
      payload.status = statusOverride;
    }

    try {
      const res = await api.put(`/projects/${team.project._id}`, payload);
      if (res.data.status === 'success') {
        alert(statusOverride ? `Project status set to ${statusOverride}!` : 'Project parameters updated successfully!');
        fetchWorkspaceDetails();
      }
    } catch (err) {
      alert('Failed to update project specs.');
    } finally {
      setUpdatingProj(false);
    }
  };

  const handleSubmitCompletion = async () => {
    try {
      const res = await api.post(`/projects/${team.project._id}/submit-completion`);
      if (res.data.status === 'success') {
        alert('Project submitted for mentor completion review successfully!');
        fetchWorkspaceDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit project for completion.');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this project and all workspace files?')) return;
    try {
      await api.delete(`/projects/${team.project._id}`);
      alert('Project deleted.');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  // 2. Applicant actions
  const handleResolveApplicant = async (appId, action) => {
    try {
      const statusMapped = action === 'Accept' ? 'Accepted' : action === 'Reject' ? 'Rejected' : action;
      const res = await api.post(`/projects/applications/${appId}/status`, { status: statusMapped });
      if (res.data.status === 'success') {
        alert(`Application successfully resolved to ${statusMapped}!`);
        fetchApplicants();
        fetchWorkspaceDetails();
      }
    } catch (err) {
      alert('Failed to resolve applicant status.');
    }
  };

  // Invite Developer
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedDevForInvite || !team?.project?._id) return;

    setInvitingDev(true);
    try {
      const res = await api.post(`/projects/${team.project._id}/invite`, {
        developerId: selectedDevForInvite._id,
        role: inviteRoleName,
        message: inviteMsgText
      });

      if (res.data.status === 'success') {
        alert('Invitation sent successfully!');
        setSelectedDevForInvite(null);
        setInviteRoleName('Member');
        setInviteMsgText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInvitingDev(false);
    }
  };

  // Direct team additions/removes/roles
  const handleAddDirectMember = async (e) => {
    e.preventDefault();
    if (!addMemberUserId) return;

    setAddingMember(true);
    try {
      const res = await api.post(`/teams/${id}/members`, {
        userId: addMemberUserId,
        role: addMemberRole
      });

      if (res.data.status === 'success') {
        alert('Member added directly to workspace!');
        setShowAddMemberModal(false);
        setAddMemberUserId('');
        setAddMemberRole('Member');
        fetchWorkspaceDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/teams/${id}/members/${userId}/role`, { role: newRole });
      if (res.data.status === 'success') {
        alert(`Member promoted to ${newRole}!`);
        fetchWorkspaceDetails();
      }
    } catch (err) {
      alert('Failed to update member role.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this developer from your project workspace?')) return;
    try {
      const res = await api.delete(`/teams/${id}/members/${userId}`);
      if (res.data.status === 'success') {
        alert('Member removed from workspace.');
        fetchWorkspaceDetails();
      }
    } catch (err) {
      alert('Failed to remove member.');
    }
  };

  // 3. Mentor Request submission
  const handleSendMentorRequest = async (e) => {
    e.preventDefault();
    if (!selectedMentorForReq || !team?.project?._id) return;

    setSendingMentorReq(true);
    try {
      const res = await api.post('/mentor-requests', {
        projectId: team.project._id,
        mentorId: selectedMentorForReq._id,
        message: mentorReqMsg
      });

      if (res.data.status === 'success') {
        alert('Mentor request sent successfully!');
        setShowMentorMsgModal(false);
        setSelectedMentorForReq(null);
        setMentorReqMsg('');
        fetchMentorRequestsLogs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setSendingMentorReq(false);
    }
  };

  // Notes addition
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setSavingNote(true);
    try {
      const res = await api.post(`/teams/${id}/notes`, { content: newNoteContent });
      if (res.data.status === 'success') {
        setNotes(prev => [res.data.data.note, ...prev]);
        setNewNoteContent('');
      }
    } catch (err) {
      alert('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  // Analytics derivations
  const closedTasksCount = tasks.filter(t => t.status === 'done' || t.status === 'Done').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'done' && t.status !== 'Done').length;
  const completionPercentage = tasks.length > 0 ? Math.round((closedTasksCount / tasks.length) * 100) : 0;

  // Member tasks completions tally
  const memberTaskCompletions = {};
  tasks.forEach((t) => {
    if ((t.status === 'done' || t.status === 'Done') && t.assigneeId) {
      memberTaskCompletions[t.assigneeId.name] = (memberTaskCompletions[t.assigneeId.name] || 0) + 1;
    }
  });

  // Individual REP logs
  const memberRepEarnings = {};
  repEvents.forEach((ev) => {
    if (ev.userId) {
      memberRepEarnings[ev.userId.name] = (memberRepEarnings[ev.userId.name] || 0) + ev.points;
    }
  });

  // EARLY RETURNS FOR SAFETY
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          <span className="text-xs text-slate-500 font-mono">Opening workspace huddle room...</span>
        </div>
      </Layout>
    );
  }

  if (error || !team) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Failed to load workspace</h3>
          <p className="text-xs text-slate-500">{error || 'Workspace could not be found.'}</p>
          <button onClick={() => navigate('/dashboard')} className="text-xs text-brand-primary font-bold hover:underline">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
        {/* Workspace Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              {team.project?.category || 'Workspace'}
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200 mt-1.5 flex items-center">
              <span>{team.project?.title || 'Collaboration Workspace'}</span>
              {isOwner && (
                <Shield className="w-5 h-5 ml-2 text-brand-primary" title="Project Owner Workspace Control" />
              )}
            </h2>
            <p className="text-xs text-slate-500 max-w-lg">
              {team.project?.description || 'Active huddle workspace room.'}
            </p>
          </div>

          <div className="flex gap-2 relative z-10">
            {meetUrl && (
              <a
                href={meetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Join Meet</span>
              </a>
            )}
            <Link
              to={`/projects/${team.project?._id}`}
              className="text-xs font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/60 px-4 py-2.5 rounded-xl transition-all"
            >
              Project Specifications
            </Link>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-900">
          {[
            { id: 'kanban', label: 'Kanban Board', icon: CheckSquare },
            { id: 'directory', label: 'Team Directory', icon: Users },
            { id: 'chat', label: 'Huddle Chat', icon: MessageSquare },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'feed', label: 'Activity Feed & Commits', icon: Activity },
            { id: 'notes', label: 'Scratch Board', icon: Megaphone }
          ].concat(
            isOwner ? [{ id: 'admin', label: 'Owner Panel', icon: Settings }] : []
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-white dark:bg-slate-950 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB RENDERS */}
        <div className="space-y-6">
          {/* TAB 1: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">Workspace Kanban Tasks</h3>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSubmitMilestoneModal(true)}
                    className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Milestone</span>
                  </button>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="flex items-center space-x-1 bg-brand-primary hover:opacity-90 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Define Task</span>
                  </button>
                </div>
              </div>

              {/* Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do */}
                <div className="rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                    <span className="text-xs font-bold text-slate-500 uppercase">To Do</span>
                    <span className="bg-slate-100 dark:bg-slate-900 text-[10px] font-bold px-2 py-0.5 rounded text-slate-500">
                      {tasks.filter(t => t.status === 'todo' || t.status === 'To Do').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'todo' || t.status === 'To Do').map(task => (
                      <div key={task._id} className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            task.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-100 text-slate-500 border'
                          }`}>
                            {task.priority || 'Medium'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{task.title}</h4>
                        <p className="text-[11px] text-slate-500">{task.description}</p>
                        
                        {task.labels?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map((l, lIdx) => (
                              <span key={lIdx} className="bg-brand-primary/10 text-brand-primary text-[8px] font-bold px-1.5 py-0.5 rounded">
                                {l}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-900">
                          <span className="text-[9px] text-slate-400 font-mono">Assignee: {task.assigneeId?.name || 'Unassigned'}</span>
                          <button onClick={() => handleMoveTask(task._id, 'todo')} className="text-[10px] font-bold text-brand-primary hover:underline">
                            Start &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                    <span className="text-xs font-bold text-slate-500 uppercase">In Progress</span>
                    <span className="bg-slate-100 dark:bg-slate-900 text-[10px] font-bold px-2 py-0.5 rounded text-slate-500">
                      {tasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').map(task => (
                      <div key={task._id} className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            task.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-100 text-slate-500 border'
                          }`}>
                            {task.priority || 'Medium'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{task.title}</h4>
                        <p className="text-[11px] text-slate-500">{task.description}</p>
                        
                        {task.labels?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map((l, lIdx) => (
                              <span key={lIdx} className="bg-brand-primary/10 text-brand-primary text-[8px] font-bold px-1.5 py-0.5 rounded">
                                {l}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-900">
                          <span className="text-[9px] text-slate-400 font-mono">Assignee: {task.assigneeId?.name || 'Unassigned'}</span>
                          <button onClick={() => handleMoveTask(task._id, 'in-progress')} className="text-[10px] font-bold text-brand-primary hover:underline">
                            Resolve &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Done */}
                <div className="rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                    <span className="text-xs font-bold text-slate-500 uppercase">Done</span>
                    <span className="bg-slate-100 dark:bg-slate-900 text-[10px] font-bold px-2 py-0.5 rounded text-slate-500">
                      {tasks.filter(t => t.status === 'done' || t.status === 'Done').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'done' || t.status === 'Done').map(task => (
                      <div key={task._id} className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm text-xs space-y-2 opacity-80 border-emerald-500/25 bg-emerald-500/5">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{task.title}</h4>
                        <p className="text-[11px] text-slate-500">{task.description}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-900">
                          <span className="text-[9px] text-slate-500 font-mono font-semibold">Completed ✓</span>
                          <span className="text-[10px] font-bold text-emerald-600 font-mono">+5 REP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-base">Huddle Directory</h3>
                
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-855 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10">
                    <div className="flex items-center space-x-3 text-left">
                      <img src={getAvatarUrl(team.owner?.avatar)} alt="Owner" className="w-8 h-8 rounded-full object-cover border" />
                      <div>
                        <span className="block text-xs font-bold">{team.owner?.name}</span>
                        <span className="block text-[10px] text-slate-400">Project Creator</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                      Owner
                    </span>
                  </div>

                  {/* Mentor */}
                  {team.project?.mentorId && (
                    <div className="flex items-center justify-between p-3 border border-brand-primary/20 rounded-2xl bg-brand-primary/5">
                      <div className="flex items-center space-x-3 text-left">
                        <img src={getAvatarUrl(team.project.mentorId.avatar)} alt="Mentor" className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="block text-xs font-bold text-brand-primary">{team.project.mentorId.name}</span>
                          <span className="block text-[10px] text-slate-400">Project Mentor</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                        Mentor
                      </span>
                    </div>
                  )}

                  {/* Teammates */}
                  {team.members?.map(m => (
                    <div key={m.user?._id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-850 rounded-2xl">
                      <div className="flex items-center space-x-3 text-left">
                        <img src={getAvatarUrl(m.user?.avatar)} alt={m.user?.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="block text-xs font-bold">{m.user?.name}</span>
                          <span className="block text-[10px] text-slate-400">{m.user?.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 capitalize bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-full border">
                        {m.role || 'Member'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meet link sharing section */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 text-left">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center space-x-3">
                  <Video className="w-8 h-8" />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-red-500">Google Meet URL</span>
                    <span className="block text-[10px] text-slate-400">Share slots with teammates.</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Shared Meet Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    disabled={!isOwner}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                {isOwner && (
                  <button
                    onClick={handleSaveMeet}
                    disabled={savingMeet}
                    className="w-full py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow"
                  >
                    {savingMeet ? 'Saving...' : 'Save Meet Link'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HUDDLE CHAT */}
          {activeTab === 'chat' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 italic">
                    Start of chat log. Say hello to teammates!
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isSenderMe = msg.sender?._id === user?._id || msg.sender?._id === user?.id || msg.sender === user?._id;
                    return (
                      <div key={idx} className={`flex items-start ${isSenderMe ? 'justify-end' : 'justify-start'} space-x-2`}>
                        {!isSenderMe && (
                          <img src={getAvatarUrl(msg.sender?.avatar)} alt={msg.sender?.name} className="w-7 h-7 rounded-full object-cover border" />
                        )}
                        <div className="text-left max-w-sm">
                          {!isSenderMe && (
                            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">{msg.sender?.name}</span>
                          )}
                          <div className={`p-3 rounded-2xl ${
                            isSenderMe
                              ? 'bg-brand-primary text-white rounded-tr-none'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded-tl-none'
                          }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 flex space-x-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
                <button type="submit" className="p-3 bg-brand-primary text-white rounded-xl shadow">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: DOCUMENTS REPOSITORY */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-base">Shared Documents</h3>

                {files.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 dark:border-slate-850 rounded-2xl">
                    No files shared in workspace.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.filter(Boolean).map(f => (
                      <div key={f._id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="flex items-center space-x-3 text-left">
                          <FileText className="w-7 h-7 text-brand-primary" />
                          <div>
                            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{f.name || f.fileName}</span>
                            <span className="block text-[10px] text-slate-400">Uploaded by: {f.uploadedBy?.name || 'Teammate'}</span>
                          </div>
                        </div>
                        <a
                          href={getFileUrl(f.url || f.fileUrl)}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 text-left">
                <h3 className="font-bold text-base">Share Document</h3>
                
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-primary/50 transition-colors">
                    <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} className="hidden" id="workspace-upload" />
                    <label htmlFor="workspace-upload" className="cursor-pointer space-y-1.5 block">
                      <Plus className="w-8 h-8 mx-auto text-slate-400" />
                      <span className="block text-xs text-slate-500 font-semibold">
                        {uploadFile ? uploadFile.name : 'Select file'}
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="w-full py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow disabled:opacity-60"
                  >
                    {uploading ? 'Sharing document...' : 'Share Document'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITY TIMELINE & COMMITS */}
          {activeTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 text-left">
                <h3 className="font-bold text-base flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-slate-400" />
                  <span>Workspace Activity Log</span>
                </h3>

                {activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    No timeline items logged.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {activityLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs">
                        <img src={getAvatarUrl(log.actorId?.avatar)} alt="Actor" className="w-6 h-6 rounded-full object-cover border" />
                        <div className="text-left space-y-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.actorId?.name || 'Teammate'}
                          </span>
                          <span className="text-slate-500 ml-1.5">{log.action}</span>
                          <span className="block text-[10px] text-slate-400">
                            {new Date(log.createdAt || log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Commits */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 text-left">
                <h3 className="font-bold text-base flex items-center">
                  <Code className="w-5 h-5 mr-2 text-indigo-500" />
                  <span>Linked GitHub Commits</span>
                </h3>

                {!team.project?.repoUrl ? (
                  <div className="p-6 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center text-xs text-slate-500">
                    No GitHub repository linked.
                  </div>
                ) : githubCommits.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    Waiting for git sync push triggers...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {githubCommits.map((commit) => (
                      <div key={commit.id} className="flex items-start justify-between p-3 border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10 font-mono text-[11px]">
                        <div className="space-y-0.5 text-left">
                          <span className="font-bold text-brand-primary">#{commit.id}</span>
                          <span className="text-slate-800 dark:text-slate-300 ml-2">{commit.msg}</span>
                          <span className="block text-[9px] text-slate-500 mt-1">Author: {commit.author}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{commit.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SCRATCHBOARD */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Draft Notes */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 text-left">
                <h3 className="font-bold text-base">Workspace Scratch Notes</h3>
                
                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Type note content..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={savingNote || !newNoteContent.trim()}
                    className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow disabled:opacity-60"
                  >
                    {savingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </form>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {notes.map(note => (
                    <div key={note._id} className="p-3 border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 text-xs">
                      <p className="text-slate-700 dark:text-slate-350">{note.content}</p>
                      <div className="text-[10px] text-slate-400 mt-2 flex justify-between items-center">
                        <span>By: {note.authorId?.name || 'Teammate'}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 text-left">
                <h3 className="font-bold text-base">Announcements Board</h3>

                {isOwner && (
                  <form onSubmit={handleAddAnn} className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-900">
                    <textarea
                      rows={3}
                      placeholder="Publish team announcement..."
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAnnPinned}
                          onChange={(e) => setNewAnnPinned(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-850"
                        />
                        <span>Pin post</span>
                      </label>
                      <button
                        type="submit"
                        disabled={postingAnn || !newAnnContent.trim()}
                        className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow"
                      >
                        {postingAnn ? 'Publishing...' : 'Publish'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {announcements.map(ann => (
                    <div
                      key={ann._id}
                      className={`p-4 rounded-2xl border text-xs text-left ${
                        ann.pinned
                          ? 'border-amber-500/25 bg-amber-500/5'
                          : 'border-slate-200 dark:border-slate-850 bg-slate-50/10 dark:bg-slate-900/5'
                      }`}
                    >
                      <p className="text-slate-700 dark:text-slate-300">{ann.content}</p>
                      <div className="text-[10px] text-slate-400 mt-2 flex justify-between items-center">
                        <span>By: {ann.authorId?.name || 'Owner'}</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROJECT OWNER CONTROL PANEL */}
          {isOwner && activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Owner Sub-tabs */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-900">
                {[
                  { id: 'analytics', label: 'Workspace Analytics', icon: TrendingUp },
                  { id: 'edit-project', label: 'Project form & Actions', icon: Settings },
                  { id: 'applicants', label: 'Applicant Board', icon: Inbox },
                  { id: 'members', label: 'Team administration', icon: Users },
                  { id: 'mentors', label: 'Mentor Request System', icon: Sparkles }
                ].map((sTab) => {
                  const Icon = sTab.icon;
                  return (
                    <button
                      key={sTab.id}
                      onClick={() => setAdminSubTab(sTab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        adminSubTab === sTab.id
                          ? 'bg-slate-900 dark:bg-slate-800 text-white border-transparent'
                          : 'bg-white dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sTab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* OWNER SUB-TAB 1: WORKSPACE ANALYTICS */}
              {adminSubTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Task Tally Box */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <BarChart className="w-5 h-5 mr-2 text-brand-primary" />
                      <span>Sprint Deliverables</span>
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Completion Percentage</span>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${completionPercentage}%` }} />
                          </div>
                          <span className="font-mono font-bold">{completionPercentage}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border">
                          <span className="block text-slate-500 text-[9px] uppercase font-bold">Closed Tasks</span>
                          <span className="block text-xl font-bold mt-1 text-emerald-500">{closedTasksCount}</span>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border">
                          <span className="block text-slate-500 text-[9px] uppercase font-bold">Pending Tasks</span>
                          <span className="block text-xl font-bold mt-1 text-brand-primary">{pendingTasksCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Velocity contributions */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <Users className="w-5 h-5 mr-2 text-indigo-500" />
                      <span>Team Velocity</span>
                    </h3>

                    {Object.keys(memberTaskCompletions).length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        No closed tasks logged by team members.
                      </div>
                    ) : (
                      <div className="space-y-3.5 text-xs">
                        {Object.entries(memberTaskCompletions).map(([mName, count]) => (
                          <div key={mName} className="flex justify-between items-center p-3 border rounded-xl bg-slate-50/20">
                            <span className="font-semibold">{mName}</span>
                            <span className="font-mono font-bold text-indigo-600">{count} Tasks Completed</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Individual REP contributions */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-amber-500" />
                      <span>Reputation Contributions</span>
                    </h3>

                    {Object.keys(memberRepEarnings).length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        No reputation transactions logged on this project.
                      </div>
                    ) : (
                      <div className="space-y-3.5 text-xs">
                        {Object.entries(memberRepEarnings).map(([mName, points]) => (
                          <div key={mName} className="flex justify-between items-center p-3 border rounded-xl bg-slate-50/20">
                            <span className="font-semibold">{mName}</span>
                            <span className="font-mono font-bold text-amber-600">+{points} PTS Earned</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OWNER SUB-TAB 2: EDIT PROJECT FORM & CONTROLS */}
              {adminSubTab === 'edit-project' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                  {/* Edit Form */}
                  <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base">Edit Project specifications</h3>

                    <form onSubmit={(e) => { e.preventDefault(); handleUpdateProjectSpecs(); }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Project Title</label>
                          <input
                            type="text"
                            required
                            value={projTitle}
                            onChange={(e) => setProjTitle(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                          <input
                            type="text"
                            required
                            value={projCategory}
                            onChange={(e) => setProjCategory(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                          rows={4}
                          required
                          value={projDesc}
                          onChange={(e) => setProjDesc(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Openings Count</label>
                          <input
                            type="number"
                            value={projOpenings}
                            onChange={(e) => setProjOpenings(parseInt(e.target.value))}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Experience level</label>
                          <select
                            value={projExp}
                            onChange={(e) => setProjExp(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="Beginner" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Beginner</option>
                            <option value="Intermediate" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Intermediate</option>
                            <option value="Advanced" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Advanced</option>
                          </select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Duration</label>
                          <input
                            type="text"
                            value={projDuration}
                            onChange={(e) => setProjDuration(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Deadline date</label>
                          <input
                            type="date"
                            value={projDeadline}
                            onChange={(e) => setProjDeadline(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Visibility</label>
                          <select
                            value={projVisibility}
                            onChange={(e) => setProjVisibility(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="public" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Public</option>
                            <option value="invite-only" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Invite Only</option>
                          </select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Work Mode</label>
                          <select
                            value={projWorkMode}
                            onChange={(e) => setProjWorkMode(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="remote" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Remote Mode</option>
                            <option value="hybrid" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Hybrid Mode</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Skills Required (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. React, Docker, Mongoose"
                          value={projSkills}
                          onChange={(e) => setProjSkills(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateProjectSpecs('Draft')}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold w-1/2 text-slate-500"
                        >
                          Save Draft
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow w-1/2"
                        >
                          {updatingProj ? 'Updating...' : 'Publish Modifications'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Sidebar actions */}
                  <div className="space-y-4">
                    {/* Status widgets */}
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 text-left">
                      <h4 className="font-bold text-sm">Control Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleUpdateProjectSpecs('Hiring Closed')}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition-all"
                        >
                          Close Hiring Slots
                        </button>
                        <button
                          onClick={() => handleUpdateProjectSpecs('Archived')}
                          className="w-full py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl shadow transition-all"
                        >
                          Archive Workspace
                        </button>
                        {team.project?.mentorId ? (
                          <button
                            onClick={handleSubmitCompletion}
                            disabled={team.project?.status === 'Pending Completion'}
                            className="w-full py-2.5 bg-indigo-600 hover:hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all disabled:opacity-50"
                          >
                            {team.project?.status === 'Pending Completion' ? 'Pending Mentor Approval' : 'Submit for Completion'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateProjectSpecs('Completed')}
                            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition-all"
                          >
                            Close & Complete Project
                          </button>
                        )}
                        <button
                          onClick={handleDeleteProject}
                          className="w-full py-2.5 border border-red-500/20 hover:bg-red-50 hover:text-white text-red-500 font-bold rounded-xl transition-all"
                        >
                          Delete Project
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OWNER SUB-TAB 3: APPLICANT BOARD */}
              {adminSubTab === 'applicants' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base">Project Candidates applications</h3>
                    <button onClick={fetchApplicants} className="text-xs text-brand-primary font-bold hover:underline">
                      Refresh lists
                    </button>
                  </div>

                  {fetchingApplicants ? (
                    <div className="text-center py-8 font-mono animate-pulse">Syncing candidate reviews...</div>
                  ) : applicants.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-3xl text-center text-slate-500">
                      No applications submitted for this project yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {applicants.map((app) => (
                        <div key={app._id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 text-left flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={getAvatarUrl(app.applicant?.avatar)}
                                  alt={app.applicant?.name}
                                  className="w-10 h-10 rounded-full object-cover border"
                                />
                                <div className="text-left space-y-0.5">
                                  <span className="block font-bold text-slate-800 dark:text-slate-200">{app.applicant?.name}</span>
                                  <span className="block text-[10px] text-slate-400">Applying for: {app.role}</span>
                                </div>
                              </div>
                              <span className="bg-amber-500/10 text-amber-500 border px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide">
                                {app.applicant?.reputation || 0} REP
                              </span>
                            </div>

                            {app.applicant?.college && (
                              <div className="text-[11px] text-slate-500 font-medium">
                                College: {app.applicant.college}
                              </div>
                            )}

                            {app.applicant?.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {app.applicant.skills.map((skill, sIdx) => (
                                  <span key={sIdx} className="bg-slate-100 dark:bg-slate-900 border text-[9px] px-2 py-0.5 rounded font-semibold text-slate-500">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {app.coverLetter && (
                              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl text-[10px] text-slate-500 leading-relaxed max-h-24 overflow-y-auto">
                                <strong>Cover letter:</strong> {app.coverLetter}
                              </div>
                            )}
                          </div>

                          {app.status === 'Pending' && (
                            <div className="flex space-x-2 pt-4 border-t border-slate-100 dark:border-slate-900">
                              <button
                                onClick={() => handleResolveApplicant(app._id, 'Reject')}
                                className="px-4 py-2 border rounded-xl font-bold w-1/2 text-slate-500"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleResolveApplicant(app._id, 'Accept')}
                                className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow w-1/2"
                              >
                                Accept candidate
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* OWNER SUB-TAB 4: TEAM MEMBERS ADMINISTRATION */}
              {adminSubTab === 'members' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-left">
                  {/* Members list */}
                  <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-base">Workspace members</h3>
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="flex items-center space-x-1 bg-brand-primary text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add direct member</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Owner */}
                      <div className="flex items-center justify-between p-3 border rounded-2xl bg-slate-50/20">
                        <div className="flex items-center space-x-3">
                          <img src={getAvatarUrl(team.owner?.avatar)} alt="Owner" className="w-8 h-8 rounded-full border object-cover" />
                          <div>
                            <span className="block font-bold">{team.owner?.name}</span>
                            <span className="block text-[10px] text-slate-400">Creator/Owner</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border px-2.5 py-0.5 rounded-full">
                          Owner
                        </span>
                      </div>

                      {/* Teammates */}
                      {team.members?.map(m => (
                        <div key={m.user?._id} className="flex items-center justify-between p-3 border rounded-2xl bg-white dark:bg-slate-900">
                          <div className="flex items-center space-x-3">
                            <img src={getAvatarUrl(m.user?.avatar)} alt={m.user?.name} className="w-8 h-8 rounded-full border object-cover" />
                            <div>
                              <span className="block font-bold">{m.user?.name}</span>
                              <span className="block text-[10px] text-slate-400">Workspace member</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Change roles / Promote */}
                            <select
                              value={m.role || 'Member'}
                              onChange={(e) => handleUpdateMemberRole(m.user?._id, e.target.value)}
                              className="bg-slate-50 border rounded-lg px-2 py-1 text-[10px] font-bold"
                            >
                              <option value="Member">Member</option>
                              <option value="Admin">Admin (Team Leader)</option>
                            </select>

                            <button
                              onClick={() => handleRemoveMember(m.user?._id)}
                              className="p-1.5 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                              title="Remove member"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invite Developer */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-brand-primary" />
                      <span>Invite Developer</span>
                    </h3>

                    <div className="flex flex-col space-y-1.5 relative">
                      <label className="font-bold text-slate-400">Search developers by skill</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. React, Node..."
                          value={searchDevQuery}
                          onChange={(e) => searchDevelopersToInvite(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none"
                        />
                        <Search className="w-4 h-4 absolute left-2.5 top-3 text-slate-400" />
                      </div>

                      {/* Dropdown search results */}
                      {searchDevQuery && developersList.length > 0 && (
                        <div className="absolute top-14 left-0 right-0 border bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-2 z-20 max-h-48 overflow-y-auto space-y-1">
                          {developersList.map((dev) => (
                            <button
                              key={dev._id}
                              type="button"
                              onClick={() => { setSelectedDevForInvite(dev); setSearchDevQuery(''); setDevelopersList([]); }}
                              className="w-full flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-xl text-left"
                            >
                              <img src={getAvatarUrl(dev.avatar)} alt={dev.name} className="w-6 h-6 rounded-full object-cover border" />
                              <span className="font-bold text-[11px]">{dev.name} ({dev.reputation || 0} REP)</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedDevForInvite && (
                      <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
                        <div className="p-3 bg-slate-50 rounded-2xl flex items-center space-x-3">
                          <img src={getAvatarUrl(selectedDevForInvite.avatar)} alt="Selected Dev" className="w-8 h-8 rounded-full border object-cover" />
                          <div className="text-left">
                            <span className="block font-bold">{selectedDevForInvite.name}</span>
                            <span className="block text-[10px] text-slate-500">Skills: {selectedDevForInvite.skills?.join(', ')}</span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-400">Offer role name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Frontend Developer"
                            value={inviteRoleName}
                            onChange={(e) => setInviteRoleName(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-bold text-slate-400">Invite Message</label>
                          <textarea
                            rows={2}
                            placeholder="Hi! I want to invite you to join..."
                            value={inviteMsgText}
                            onChange={(e) => setInviteMsgText(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={invitingDev}
                          className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow"
                        >
                          {invitingDev ? 'Sending invite...' : 'Send invitation'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* OWNER SUB-TAB 5: MENTOR REQUEST SYSTEM */}
              {adminSubTab === 'mentors' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-left">
                  {/* Browse / Search Mentors */}
                  <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <Search className="w-5 h-5 mr-2 text-brand-primary" />
                      <span>Browse registered mentors</span>
                    </h3>

                    {/* Search box filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search mentor name..."
                          value={mentorSearch}
                          onChange={(e) => setMentorSearch(e.target.value)}
                          className="w-full bg-slate-50 border rounded-xl pl-8 pr-3 py-2 focus:outline-none"
                        />
                        <Search className="w-4 h-4 absolute left-2.5 top-3 text-slate-400" />
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Filter expertise (comma separated)..."
                          value={mentorExpertise}
                          onChange={(e) => setMentorExpertise(e.target.value)}
                          className="w-full bg-slate-50 border rounded-xl pl-8 pr-3 py-2 focus:outline-none"
                        />
                        <Sparkles className="w-4 h-4 absolute left-2.5 top-3 text-slate-400" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
                      <button
                        onClick={fetchMentors}
                        className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all"
                      >
                        Search Mentors
                      </button>
                    </div>

                    {fetchingMentors ? (
                      <div className="text-center py-8 font-mono animate-pulse">Filtering mentors database...</div>
                    ) : mentorsList.length === 0 ? (
                      <div className="p-8 border border-dashed rounded-3xl text-center text-slate-500">
                        No registered mentors matched your search query.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {mentorsList.map((mentor) => (
                          <div key={mentor._id} className="flex justify-between items-center p-3 border rounded-2xl bg-white dark:bg-slate-950">
                            <div className="flex items-center space-x-3 text-left">
                              <img src={getAvatarUrl(mentor.avatar)} alt={mentor.name} className="w-8 h-8 rounded-full border object-cover" />
                              <div>
                                <span className="block font-bold">{mentor.name} ({mentor.reputation || 0} REP)</span>
                                <span className="block text-[10px] text-slate-400 max-w-sm">Expertise: {mentor.skills?.join(', ') || 'General'}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => { setSelectedMentorForReq(mentor); setMentorReqMsg(''); setShowMentorMsgModal(true); }}
                              className="px-3.5 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-sm text-[10px]"
                            >
                              Send request
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mentor requests status tracking logs */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center">
                      <ClipboardList className="w-5 h-5 mr-2 text-indigo-500" />
                      <span>Mentor requests status</span>
                    </h3>                    {mentorRequests.length === 0 ? (
                      <div className="p-6 border border-dashed rounded-2xl text-center text-slate-500">
                        No mentor requests sent.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mentorRequests.map((reqItem) => (
                          <div key={reqItem._id} className="p-3 border rounded-2xl bg-slate-50/20 text-xs text-left space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {reqItem.mentorId?.name || 'Mentor'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                reqItem.status === 'Accepted'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : reqItem.status === 'Rejected'
                                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                                {reqItem.status}
                              </span>
                            </div>
                            {reqItem.message && (
                              <p className="text-[10px] text-slate-500 italic">"{reqItem.message}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Incoming Mentor Applications */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 col-span-1 lg:col-span-3">
                    <h3 className="font-bold text-base flex items-center">
                      <Users className="w-5 h-5 mr-2 text-brand-primary" />
                      <span>Incoming Mentor Applications</span>
                    </h3>

                    {fetchingMentorApps ? (
                      <div className="text-center py-6 animate-pulse">Syncing applications...</div>
                    ) : incomingMentorApps.length === 0 ? (
                      <div className="p-8 border border-dashed rounded-2xl text-center text-slate-500 italic">
                        No mentors have applied to this project yet. Keep project public to invite interest.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {incomingMentorApps.map((app) => (
                          <div key={app._id} className="p-4 border rounded-2xl bg-slate-50/20 text-xs text-left space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-2">
                                <img src={getAvatarUrl(app.mentorId?.avatar)} alt="Mentor" className="w-8 h-8 rounded-full border object-cover" />
                                <div>
                                  <span className="block font-bold">{app.mentorId?.name}</span>
                                  <span className="block text-[9px] text-slate-400">{app.mentorId?.company || 'Freelance'}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>{app.status}</span>
                            </div>

                            <div className="space-y-1">
                              <span className="block font-bold text-slate-500 text-[9px] uppercase">Cover Message</span>
                              <p className="text-slate-500 italic">"{app.message}"</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                              <div>
                                <span className="block text-[8px] text-slate-400 uppercase font-bold">Expertise</span>
                                <span className="font-semibold text-slate-700">{app.expertise || 'General'}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-slate-400 uppercase font-bold">Experience</span>
                                <span className="font-semibold text-slate-700">{app.experience || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-slate-400 uppercase font-bold">Rating / REP</span>
                                <span className="font-semibold text-slate-700">★ {app.mentorId?.rating || 5.0} ({app.mentorId?.reputation || 0} REP)</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                              <div>
                                <span className="block text-[8px] text-slate-400 uppercase font-bold">Availability</span>
                                <span className="font-semibold text-slate-700">{app.availability || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-slate-400 uppercase font-bold">Mentored count</span>
                                <span className="font-semibold text-slate-700">{app.mentorId?.projectsMentoredCount || 0} Projects</span>
                              </div>
                            </div>

                            {app.status === 'Pending' && (
                              <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                                <button
                                  onClick={() => setPreviewingMentorProfile(app.mentorId)}
                                  className="py-1.5 border rounded-lg hover:bg-slate-50 text-[9px] font-bold text-center"
                                >
                                  Profile
                                </button>
                                <button
                                  onClick={() => { setSelectedMentorForReq(app.mentorId); setMentorReqMsg(''); setShowMentorMsgModal(true); }}
                                  className="py-1.5 border rounded-lg hover:bg-slate-50 text-[9px] font-bold text-center"
                                >
                                  Message
                                </button>
                                <button
                                  onClick={() => { setRejectingAppId(app._id); setRejectionReasonText(''); setShowRejectionModal(true); }}
                                  className="py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-[9px] font-bold text-center"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleResolveMentorApplication(app._id, 'Accepted')}
                                  className="py-1.5 bg-brand-primary text-white rounded-lg hover:opacity-90 text-[9px] font-bold text-center"
                                >
                                  Accept
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
            </div>
          )}
        </div>

        {/* MENTOR MSG MODAL */}
        <AnimatePresence>
          {showMentorMsgModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMentorMsgModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base">Mentorship invitation</h3>
                  <p className="text-xs text-slate-500 mt-1">Specify request details for mentor {selectedMentorForReq?.name}.</p>
                </div>

                <form onSubmit={handleSendMentorRequest} className="space-y-4">
                  <div className="flex flex-col space-y-1.5 text-xs">
                    <label className="font-bold text-slate-400">Request Message</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Hi, I'd like to invite you as mentor for my project..."
                      value={mentorReqMsg}
                      onChange={(e) => setMentorReqMsg(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowMentorMsgModal(false)}
                      className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingMentorReq}
                      className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2"
                    >
                      {sendingMentorReq ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DEFINE TASK MODAL */}
        <AnimatePresence>
          {showAddTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddTaskModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base">Create Kanban Task</h3>
                  <p className="text-xs text-slate-500 mt-1">Define task parameters and allocate to teammates.</p>
                </div>

                <form onSubmit={handleAddTask} className="space-y-4 text-xs">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-500">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Design Landing Page layout"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-500">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Specify deliverables..."
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-bold text-slate-500">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="font-bold text-slate-500">Labels (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. bug, UI, auth"
                        value={newTaskLabels}
                        onChange={(e) => setNewTaskLabels(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-500">Assign To Teammate</label>
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="">Unassigned...</option>
                      <option value={team.owner?._id}>{team.owner?.name} (Owner)</option>
                      {team.members?.map(m => (
                        <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={taskLoading}
                      className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2"
                    >
                      {taskLoading ? 'Creating...' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DIRECT TEAM ADD MODAL */}
        <AnimatePresence>
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddMemberModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base">Add direct team member</h3>
                  <p className="text-xs text-slate-500 mt-1">Directly add a registered user to this project workspace.</p>
                </div>

                <form onSubmit={handleAddDirectMember} className="space-y-4 text-xs">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-500">User ID</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Mongoose User ID..."
                      value={addMemberUserId}
                      onChange={(e) => setAddMemberUserId(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-500">Workspace Role</label>
                    <select
                      value={addMemberRole}
                      onChange={(e) => setAddMemberRole(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none"
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin (Team Leader)</option>
                    </select>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(false)}
                      className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingMember}
                      className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2"
                    >
                      {addingMember ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUBMIT MILESTONE MODAL */}
        <AnimatePresence>
          {showSubmitMilestoneModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSubmitMilestoneModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base">Submit Workspace Milestone</h3>
                  <p className="text-xs text-slate-500 mt-1">Specify milestone details and progress logs to submit for review.</p>
                </div>

                <form onSubmit={handleMilestoneSubmit} className="space-y-4 text-xs">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-400">Milestone Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Milestone 1: Core Landing Page UI"
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-400">Demonstration / Repo URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={milestoneLink}
                      onChange={(e) => setMilestoneLink(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-400">Progress Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Detail features completed and ready for rating review..."
                      value={milestoneNotes}
                      onChange={(e) => setMilestoneNotes(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitMilestoneModal(false)}
                      className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={milestoneLoading}
                      className="px-4 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow w-1/2"
                    >
                      {milestoneLoading ? 'Submitting...' : 'Submit Milestone'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* REJECTION REASON MODAL */}
        <AnimatePresence>
          {showRejectionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRejectionModal(false)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Reject Mentor Application</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Specify rejection comments (optional):</p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <textarea
                    rows={3}
                    placeholder="Specify reasons..."
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button onClick={() => setShowRejectionModal(false)} className="px-4 py-2 border rounded-xl text-[10px] font-bold text-slate-500 w-1/2">Cancel</button>
                  <button onClick={() => { handleResolveMentorApplication(rejectingAppId, 'Rejected', rejectionReasonText); setShowRejectionModal(false); }} className="px-4 py-2 bg-red-500 text-white text-[10px] font-bold rounded-xl shadow w-1/2">Reject Application</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MENTOR PROFILE PREVIEW MODAL */}
        <AnimatePresence>
          {previewingMentorProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPreviewingMentorProfile(null)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center space-x-2">
                    <img src={getAvatarUrl(previewingMentorProfile.avatar)} alt="Avatar" className="w-10 h-10 rounded-full border object-cover" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">{previewingMentorProfile.name}</h4>
                      <span className="block text-[9px] text-slate-400">{previewingMentorProfile.company || 'Freelance'}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold">{previewingMentorProfile.reputation || 0} REP</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">Expertise / Skills</span>
                    <span className="block font-semibold text-slate-700 mt-0.5">{previewingMentorProfile.skills?.join(', ') || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">Experience (Years)</span>
                    <span className="block font-semibold text-slate-700 mt-0.5">{previewingMentorProfile.experienceYears || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">Bio</span>
                    <p className="text-slate-500 mt-0.5 italic">"{previewingMentorProfile.bio || 'No bio specified.'}"</p>
                  </div>
                </div>
                <div className="pt-2 text-right border-t">
                  <button onClick={() => setPreviewingMentorProfile(null)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl">Close</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default TeamWorkspace;
