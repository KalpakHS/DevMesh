import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  MessageSquare,
  TrendingUp,
  Settings,
  User,
  Eye,
  Award,
  Video,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  Linkedin,
  ChevronRight,
  Globe,
  Send,
  Bookmark,
  DollarSign,
  AlertCircle,
  Archive,
  Paperclip
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

const DeveloperRecruitment = () => {
  const { socket } = useSocket();
  const { user, updateUserProfile } = useAuth();
  console.log("DeveloperRecruitment: Component initialization", { user: user?._id || user?.id, role: user?.role });
  const messagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('pipeline'); // pipeline, invitations, offers, interviews, messages, analytics, settings
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);

  // Sourcing collections
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [offers, setOffers] = useState([]);

  // Messages tab state
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState('offline');

  // Settings tab form state
  const [hiringStatus, setHiringStatus] = useState('Available for Hiring');
  const [openToRecruiters, setOpenToRecruiters] = useState(true);
  const [hideProfileFromRecruiters, setHideProfileFromRecruiters] = useState(false);
  const [availableForInternships, setAvailableForInternships] = useState(false);
  const [availableForFullTime, setAvailableForFullTime] = useState(false);
  const [preferredJobRole, setPreferredJobRole] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate');
  const [hackerrank, setHackerrank] = useState('');
  const [submittingSettings, setSubmittingSettings] = useState(false);

  // Offer management response
  const [offerQuestions, setOfferQuestions] = useState('');
  const [offerQuestionsModal, setOfferQuestionsModal] = useState(null);

  // Recruiter Profile Modal
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [loadingRecruiter, setLoadingRecruiter] = useState(false);

  const fetchRecruitmentData = async () => {
    try {
      console.log("DeveloperRecruitment: fetchRecruitmentData initiated");
      setLoading(true);
      const res = await api.get('/users/recruitment-activity');
      console.log("DeveloperRecruitment: fetchRecruitmentData /users/recruitment-activity response received", res.data.status);
      if (res.data.status === 'success') {
        setActivityData(res.data.data);
      }

      // Fetch Applications
      const appsRes = await api.get('/users/jobs-applications');
      console.log("DeveloperRecruitment: /users/jobs-applications response", appsRes.data.status, appsRes.data.data?.applications?.length);
      if (appsRes.data.status === 'success') {
        setApplications(appsRes.data.data.applications || []);
      }

      // Fetch Invitations
      const invitesRes = await api.get('/users/invitations');
      console.log("DeveloperRecruitment: /users/invitations response", invitesRes.data.status, invitesRes.data.data?.invitations?.length);
      if (invitesRes.data.status === 'success') {
        setInvitations(invitesRes.data.data.invitations || []);
      }

      // Fetch Offers
      const offersRes = await api.get('/users/offers');
      console.log("DeveloperRecruitment: /users/offers response", offersRes.data.status, offersRes.data.data?.offers?.length);
      if (offersRes.data.status === 'success') {
        setOffers(offersRes.data.data.offers || []);
      }
    } catch (err) {
      console.error('Failed to load recruitment data:', err.message);
    } finally {
      console.log("DeveloperRecruitment: setLoading(false)");
      setLoading(false);
    }
  };

  const fetchSelfSettings = async () => {
    const userId = user?._id || user?.id || localStorage.getItem('userId');
    if (!userId) return;
    try {
      const res = await api.get(`/users/profile/${userId}`);
      if (res.data.status === 'success') {
        const u = res.data.data.user;
        if (u) {
          setHiringStatus(u.hiringStatus || 'Available for Hiring');
          setOpenToRecruiters(u.openToRecruiters !== undefined ? u.openToRecruiters : true);
          setHideProfileFromRecruiters(u.hideProfileFromRecruiters || false);
          setAvailableForInternships(u.availableForInternships || false);
          setAvailableForFullTime(u.availableForFullTime || false);
          setPreferredJobRole(u.preferredJobRole || '');
          setPreferredLocation(u.preferredLocation || '');
          setExpectedSalary(u.expectedSalary || '');
          setNoticePeriod(u.noticePeriod || 'Immediate');
          setHackerrank(u.hackerrank || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch self settings:', err);
    }
  };

  useEffect(() => {
    fetchRecruitmentData();
    fetchSelfSettings();
  }, [user]);

  // Fetch Conversations list for developer
  const fetchConversations = async (selectPartnerId = null) => {
    try {
      const res = await api.get('/recruiter/conversations');
      if (res.data.status === 'success') {
        const convs = res.data.data.conversations || [];
        setConversations(convs);
        if (selectPartnerId) {
          const partnerObj = convs.find(c => c.partner?._id === selectPartnerId);
          if (partnerObj) setActivePartner(partnerObj.partner);
        } else if (convs.length > 0 && !activePartner) {
          setActivePartner(convs[0].partner);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // Load chat messages
  const fetchMessages = async (partnerId) => {
    if (!partnerId) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/recruiter/messages/${partnerId}`);
      if (res.data.status === 'success') {
        setMessages(res.data.data.messages || []);
        // Trigger read receipt
        if (socket) {
          socket.emit('recruiter_read_receipt', { partnerId });
        }
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activePartner) {
      fetchMessages(activePartner._id);
    }
  }, [activePartner]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket inbox listener
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      if (activePartner && (message.senderId?._id === activePartner._id || message.recipientId?._id === activePartner._id || message.senderId === activePartner._id || message.recipientId === activePartner._id)) {
        setMessages(prev => [...prev, message]);
        // Send read receipt
        socket.emit('recruiter_read_receipt', { partnerId: activePartner._id });
      }
      fetchConversations(activePartner?._id);
    };

    const handleTypingStatus = ({ senderId, isTyping }) => {
      if (activePartner && senderId === activePartner._id) {
        setPartnerTyping(isTyping);
      }
    };

    const handleStatusChanged = ({ userId, status }) => {
      if (activePartner && userId === activePartner._id) {
        setPartnerStatus(status);
      }
    };

    socket.on('recruiter_message_received', handleIncomingMessage);
    socket.on('recruiter_typing_status', handleTypingStatus);
    socket.on('user_status_changed', handleStatusChanged);

    return () => {
      socket.off('recruiter_message_received', handleIncomingMessage);
      socket.off('recruiter_typing_status', handleTypingStatus);
      socket.off('user_status_changed', handleStatusChanged);
    };
  }, [socket, activePartner, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!replyText.trim() && !attachmentUrl) || !activePartner || !socket) return;

    const payload = {
      recipientId: activePartner._id,
      content: replyText,
      attachments: attachmentUrl ? [{ name: attachmentName || 'Attachment', url: attachmentUrl }] : []
    };

    socket.emit('recruiter_send_message', payload);

    // Append temporarily locally
    const tempMsg = {
      _id: Date.now().toString(),
      senderId: { _id: user?._id || user?.id, name: user?.name, avatar: user?.avatar },
      recipientId: activePartner,
      content: replyText,
      attachments: attachmentUrl ? [{ name: attachmentName || 'Attachment', url: attachmentUrl }] : [],
      isRead: false,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, tempMsg]);

    setReplyText('');
    setAttachmentUrl('');
    setAttachmentName('');
    // Trigger typing stop
    socket.emit('recruiter_typing', { recipientId: activePartner._id, isTyping: false });
  };

  const handleTyping = (e) => {
    setReplyText(e.target.value);
    if (!socket || !activePartner) return;
    const isTyping = e.target.value.length > 0;
    socket.emit('recruiter_typing', { recipientId: activePartner._id, isTyping });
  };

  // Respond to Interview Invitations
  const handleRespondInterview = async (ivId, responseStatus) => {
    try {
      const res = await api.put(`/users/interviews/${ivId}/respond`, { status: responseStatus });
      if (res.data.status === 'success') {
        alert(`Interview invitation ${responseStatus.toLowerCase()}!`);
        fetchRecruitmentData();
      }
    } catch (err) {
      alert('Failed to respond to interview invitation.');
    }
  };

  // Respond to Recruiter direct invitation
  const handleRespondInvitation = async (inviteId, responseStatus) => {
    try {
      const res = await api.put(`/users/invitations/${inviteId}/respond`, { status: responseStatus });
      if (res.data.status === 'success') {
        alert(`Invitation status updated to: ${responseStatus}`);
        fetchRecruitmentData();
      }
    } catch (err) {
      alert('Failed to respond to invitation.');
    }
  };

  // Respond to Job Offer
  const handleRespondOffer = async (offerId, responseStatus) => {
    try {
      const res = await api.put(`/users/offers/${offerId}/respond`, {
        status: responseStatus,
        questions: responseStatus === 'Questions Asked' ? offerQuestions : undefined
      });
      if (res.data.status === 'success') {
        alert(`Job offer status updated to: ${responseStatus}`);
        setOfferQuestionsModal(null);
        setOfferQuestions('');
        fetchRecruitmentData();
      }
    } catch (err) {
      alert('Failed to submit offer response.');
    }
  };

  // Update recruitment preferences
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSubmittingSettings(true);
    try {
      const res = await api.put('/users/recruitment-settings', {
        hiringStatus,
        openToRecruiters,
        hideProfileFromRecruiters,
        availableForInternships,
        availableForFullTime,
        preferredJobRole,
        preferredLocation,
        expectedSalary,
        noticePeriod,
        hackerrank
      });
      if (res.data.status === 'success') {
        alert('Recruitment visibility settings saved successfully!');
        // Update global context user details
        if (user) {
          updateUserProfile({
            ...user,
            hiringStatus,
            openToRecruiters,
            hideProfileFromRecruiters,
            availableForInternships,
            availableForFullTime,
            preferredJobRole,
            preferredLocation,
            expectedSalary,
            noticePeriod,
            hackerrank
          });
        }
      }
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSubmittingSettings(false);
    }
  };

  // View Recruiter Profile Modal Loader
  const handleViewRecruiter = async (recruiterId) => {
    setLoadingRecruiter(true);
    setSelectedRecruiter(recruiterId);
    try {
      const res = await api.get(`/users/recruiter-profile/${recruiterId}`);
      if (res.data.status === 'success') {
        setRecruiterProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load recruiter company profile:', err);
    } finally {
      setLoadingRecruiter(false);
    }
  };

  if (loading) {
    console.log("DeveloperRecruitment: rendering loading screen");
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing developer recruitment dossier...
        </div>
      </Layout>
    );
  }

  console.log("DeveloperRecruitment: rendering main dashboard view", { activityData: !!activityData, applications: applications.length, invitations: invitations.length });

  const { 
    views = { today: 0, week: 0, month: 0 }, 
    bookmarkedCompanies = [], 
    interviews = [], 
    resumeDownloads = [] 
  } = activityData || {};

  try {
    return (
      <Layout>
        <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner with Sourcing Tabs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Career Pipeline Hub
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Developer Recruitment Desk</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mt-0.5">
              Manage incoming invitations, review applications pipelines, correspond to interviews, and negotiate offers.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl border">
            {[
              { id: 'pipeline', label: 'Job Applications' },
              { id: 'invitations', label: 'Invitations' },
              { id: 'interviews', label: 'Interviews' },
              { id: 'offers', label: 'Job Offers' },
              { id: 'messages', label: 'Chat Messaging' },
              { id: 'settings', label: 'Settings' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[10px] uppercase ${
                  activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: PIPELINE / JOB APPLICATIONS */}
        {activeTab === 'pipeline' && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base">Submitted Job Applications</h3>
            <p className="text-slate-500">Track the live pipeline progress of jobs you applied for on the marketplace.</p>

            {applications.filter(app => app && app.jobId).length === 0 ? (
              <div className="p-12 border border-dashed rounded-2xl text-center text-slate-400 italic">
                You haven't submitted any job applications yet. Visit the Jobs Marketplace to apply!
              </div>
            ) : (
              <div className="space-y-4">
                {applications.filter(app => app && app.jobId).map((app) => (
                  <div key={app._id} className="p-5 border rounded-2xl space-y-3 bg-slate-50/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <img
                          src={app.jobId?.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=80'}
                          alt="Logo"
                          className="w-8 h-8 rounded-lg object-cover border"
                        />
                        <div>
                          <span className="font-extrabold text-slate-800 text-sm block leading-none">{app.jobId?.title}</span>
                          <span className="text-xs text-slate-500 font-bold">{app.jobId?.company}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Progress stepper */}
                    <div className="flex items-center justify-between relative py-2 pt-4">
                      <div className="absolute left-0 right-0 h-0.5 bg-slate-100 top-1/2 -translate-y-1/2 z-0" />
                      {[
                        { label: 'Applied', active: ['Applied', 'Shortlisted', 'Interview', 'Selected'].includes(app.status) },
                        { label: 'Shortlisted', active: ['Shortlisted', 'Interview', 'Selected'].includes(app.status) },
                        { label: 'Interview Scheduled', active: ['Interview', 'Selected'].includes(app.status) },
                        { label: 'Selected / Offer', active: app.status === 'Selected' },
                        { label: 'Application Rejected', active: app.status === 'Rejected' }
                      ].map((step, sIdx) => {
                        if (sIdx === 4 && app.status !== 'Rejected') return null;
                        if (sIdx === 3 && app.status === 'Rejected') return null;

                        return (
                          <div key={sIdx} className="z-10 flex flex-col items-center space-y-1">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                              step.active
                                ? app.status === 'Rejected' && sIdx === 4 ? 'bg-red-500 text-white border-transparent' : 'bg-indigo-600 text-white border-transparent'
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}>
                              {sIdx + 1}
                            </div>
                            <span className={`text-[10px] font-extrabold ${step.active ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVITATIONS */}
        {activeTab === 'invitations' && (
          <div className="rounded-3xl border dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Direct Recruitment Invitations</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400">Sourcing invitations sent directly by recruiters matching your verified skills.</p>

            {invitations.length === 0 ? (
              <div className="p-12 border border-dashed rounded-2xl text-center text-slate-400 italic">
                No direct recruiter invitations received.
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invite) => (
                  <div key={invite._id} className="p-5 border dark:border-slate-800 rounded-2xl bg-slate-50/10 dark:bg-slate-900/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{invite.company}</span>
                        <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-base leading-none mt-1">{invite.position}</h4>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        invite.status === 'Pending' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' :
                        invite.status === 'Accepted' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {invite.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-2xl border dark:border-slate-800">
                      "{invite.message || 'We are interested in evaluating you for an engineering position.'}"
                    </p>

                    {invite.status === 'Pending' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleRespondInvitation(invite._id, 'Rejected')}
                          className="px-4 py-2 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-red-500 font-bold"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleRespondInvitation(invite._id, 'Maybe Later')}
                          className="px-4 py-2 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-bold"
                        >
                          Maybe Later
                        </button>
                        <button
                          onClick={() => handleRespondInvitation(invite._id, 'Accepted')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                        >
                          Accept & Apply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INTERVIEWS */}
        {activeTab === 'interviews' && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Upcoming Interview Schedules</span>
            </h3>

            {interviews.length === 0 ? (
              <div className="p-12 border border-dashed rounded-2xl text-center text-slate-400 italic">
                No interview sessions currently scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((iv) => (
                  <div key={iv._id} className="p-5 border rounded-2xl space-y-3.5 bg-slate-50/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">{iv.title}</h4>
                        <span className="block text-[9px] text-slate-400 mt-0.5">Host: {iv.recruiter?.name} ({iv.company})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        iv.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                        iv.status === 'Declined' ? 'bg-red-50 text-red-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {iv.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 pt-2 border-t">
                      <div>
                        <span className="block text-[8px] text-slate-400 font-bold uppercase">Date & Time</span>
                        <span className="font-bold text-slate-700">{new Date(iv.dateTime).toLocaleDateString()} at {new Date(iv.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-bold uppercase">Meet Link</span>
                        {iv.mode === 'Online' && iv.meetLink ? (
                          <a href={iv.meetLink} target="_blank" rel="noreferrer" className="text-indigo-650 font-bold flex items-center hover:underline mt-0.5">
                            <Video className="w-3.5 h-3.5 mr-1" />
                            <span>Google Meet</span>
                          </a>
                        ) : (
                          <span className="font-bold text-slate-700 mt-0.5 block truncate">{iv.location || 'Offline Office'}</span>
                        )}
                      </div>
                    </div>

                    {iv.status === 'Scheduled' && (
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => handleRespondInterview(iv._id, 'Declined')}
                          className="w-1/2 py-2 border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-xl text-center"
                        >
                          Decline invitation
                        </button>
                        <button
                          onClick={() => handleRespondInterview(iv._id, 'Accepted')}
                          className="w-1/2 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-center"
                        >
                          Accept schedule
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: JOB OFFERS */}
        {activeTab === 'offers' && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center">
              <Award className="w-5 h-5 mr-2 text-emerald-500" />
              <span>Offer Letters</span>
            </h3>

            {offers.length === 0 ? (
              <div className="p-12 border border-dashed rounded-2xl text-center text-slate-400 italic">
                No offer letters received yet. Complete interview loops to receive placements!
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer._id} className="p-5 border rounded-2xl bg-slate-50/15 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{offer.company}</span>
                        <h4 className="font-extrabold text-slate-800 text-base leading-none mt-1">{offer.role}</h4>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        offer.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                        offer.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {offer.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white border p-3 rounded-xl">
                      <div>
                        <span className="block text-slate-450 font-bold uppercase text-[9px]">Salary/Stipend</span>
                        <span className="font-bold text-slate-700">{offer.salary || 'Competitive'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-450 font-bold uppercase text-[9px]">Location</span>
                        <span className="font-bold text-slate-700">{offer.location || 'Remote'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-450 font-bold uppercase text-[9px]">Joining Date</span>
                        <span className="font-bold text-slate-700">{new Date(offer.joiningDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {offer.offerLetterUrl && (
                      <a
                        href={offer.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-indigo-650 hover:underline font-bold text-xs"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        <span>Download Offer Letter Specification</span>
                      </a>
                    )}

                    {offer.status === 'Sent' && (
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => handleRespondOffer(offer._id, 'Rejected')}
                          className="px-4 py-2 border rounded-xl hover:bg-slate-50 text-red-500 font-bold"
                        >
                          Decline Offer
                        </button>
                        <button
                          onClick={() => setOfferQuestionsModal(offer)}
                          className="px-4 py-2 border rounded-xl hover:bg-slate-50 text-slate-500 font-bold"
                        >
                          Ask Questions
                        </button>
                        <button
                          onClick={() => handleRespondOffer(offer._id, 'Accepted')}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold"
                        >
                          Accept Offer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CHAT MESSAGING */}
        {activeTab === 'messages' && (
          <div className="rounded-3xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex h-[480px] overflow-hidden">
            {/* Conversations list sidebar */}
            <div className="w-1/3 border-r dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950">
              <span className="p-4 border-b dark:border-slate-800 font-extrabold text-slate-800 dark:text-slate-200 text-sm">Recruiters Inbox</span>
              <div className="flex-1 overflow-y-auto">
                {conversations.filter(c => c && c.partner).length === 0 ? (
                  <div className="p-6 text-center text-slate-400 italic">No recruitment conversations.</div>
                ) : (
                  conversations.filter(c => c && c.partner).map((c, index) => (
                    <div
                      key={c.partner?._id || index}
                      onClick={() => setActivePartner(c.partner)}
                      className={`p-3 border-b dark:border-slate-800 flex items-start space-x-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                        activePartner?._id === c.partner?._id ? 'bg-white dark:bg-slate-900 border-l-4 border-l-indigo-500' : ''
                      }`}
                    >
                      <img
                        src={getAvatarUrl(c.partner?.avatar)}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover border dark:border-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block text-xs">{c.partner?.name}</span>
                          {c.unreadCount > 0 && (
                            <span className="bg-indigo-600 text-white font-extrabold text-[8px] rounded-full px-1.5 py-0.5">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold truncate">
                          {c.partner?.company || 'Talent Scout'}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {c.lastMessage?.content || 'Sent attachment'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conversation Window */}
            <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 h-full">
              {activePartner ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-950">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={getAvatarUrl(activePartner.avatar)}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover border dark:border-slate-800"
                      />
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block leading-none">{activePartner.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                          {activePartner.company || 'Talent Scout'} • <span className={partnerStatus === 'online' ? 'text-emerald-500' : 'text-slate-400'}>{partnerStatus}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message logs */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20 dark:bg-slate-950/20">
                    {loadingMessages ? (
                      <div className="text-center py-6 text-slate-400 italic">Syncing messages...</div>
                    ) : (
                      messages.map((m) => {
                        const isSelf = m.senderId?._id === user?._id || m.senderId?._id === user?.id || m.senderId === user?._id || m.senderId === user?.id;
                        return (
                          <div key={m._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl border text-xs shadow-sm ${
                              isSelf ? 'bg-indigo-600 text-white border-transparent rounded-tr-none' : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-tl-none'
                            }`}>
                              <p className="leading-relaxed">{m.content}</p>
                              {m.attachments?.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`mt-2 p-2 rounded-xl flex items-center space-x-2 border text-[10px] font-bold ${
                                    isSelf ? 'bg-indigo-700/50 border-indigo-500 text-indigo-100' : 'bg-slate-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-slate-800'
                                  }`}
                                >
                                  <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{att.name}</span>
                                </a>
                              ))}
                              <span className="block text-[8px] opacity-70 text-right mt-1.5">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {partnerTyping && (
                      <div className="text-[10px] text-slate-500 italic pl-1">
                        Recruiter is typing...
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply controls */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={replyText}
                      onChange={handleTyping}
                      className="border rounded-2xl px-4 py-2 text-xs flex-1 bg-slate-50/50 focus:outline-none"
                    />

                    {/* Simple Attachment Link Input */}
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter file/link URL:');
                        if (url) {
                          setAttachmentUrl(url);
                          setAttachmentName(url.split('/').pop() || 'Shared Document');
                        }
                      }}
                      className={`p-2 rounded-xl border hover:bg-slate-100 transition-colors ${
                        attachmentUrl ? 'text-indigo-650 bg-indigo-50' : 'text-slate-400 bg-slate-50'
                      }`}
                      title="Attach file link"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="submit"
                      className="bg-indigo-650 hover:bg-indigo-700 text-white p-2 rounded-xl shadow-md transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">
                  Select a recruiter conversation thread to reply.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-6 max-w-xl mx-auto">
            <h3 className="font-bold text-base flex items-center border-b pb-3">
              <Settings className="w-5 h-5 mr-2 text-indigo-550" />
              <span>Configure Sourcing Visibility</span>
            </h3>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Hiring Visibility Status</label>
                <select
                  value={hiringStatus}
                  onChange={(e) => setHiringStatus(e.target.value)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 w-full text-xs focus:outline-none font-bold text-slate-800"
                >
                  <option value="Available for Hiring">Available for Hiring (Visible to recruiters)</option>
                  <option value="Actively Looking">Actively Looking (Highlighted in candidates search)</option>
                  <option value="Not Looking">Not Looking (Invisible/Blocked from search)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Preferred Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineer, React Specialist"
                  value={preferredJobRole}
                  onChange={(e) => setPreferredJobRole(e.target.value)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 w-full text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Preferred Location</label>
                <input
                  type="text"
                  placeholder="e.g. Remote, Boston, London"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 w-full text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Expected Salary/Stipend</label>
                <input
                  type="text"
                  placeholder="e.g. $100,000 / year or $3,000 / month"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 w-full text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Notice Period</label>
                <select
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 w-full text-xs focus:outline-none"
                >
                  <option value="Immediate">Immediate Availability</option>
                  <option value="15 Days">15 Days</option>
                  <option value="1 Month">1 Month Notice Period</option>
                  <option value="2 Months">2 Months Notice Period</option>
                  <option value="Currently Studying">Currently Studying</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">HackerRank Username</label>
                <input
                  type="text"
                  placeholder="HackerRank Username"
                  value={hackerrank}
                  onChange={(e) => setHackerrank(e.target.value)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 w-full text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingSettings}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm"
              >
                {submittingSettings ? 'Saving Visibility dossier...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Offer Questions Modal */}
      {offerQuestionsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setOfferQuestionsModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-base text-slate-800">Negotiate / Ask Questions</h3>
            <textarea
              required
              placeholder="State your queries regarding joining date, compensation details, etc."
              rows={4}
              value={offerQuestions}
              onChange={(e) => setOfferQuestions(e.target.value)}
              className="border bg-slate-50/50 rounded-2xl p-3 text-xs w-full focus:outline-none"
            />
            <button
              onClick={() => handleRespondOffer(offerQuestionsModal._id, 'Questions Asked')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 text-xs rounded-xl transition-colors"
            >
              Submit Queries
            </button>
          </div>
        </div>
      )}
      </Layout>
    );
  } catch (err) {
    console.error("EXACT RUNTIME ERROR:", err);
    return (
      <Layout>
        <div className="p-8 bg-red-50 text-red-700 border border-red-200 rounded-3xl m-6 max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-2">React Render Error</h1>
          <p className="mb-4 text-sm font-semibold">{err.message}</p>
          <pre className="text-xs overflow-auto bg-white p-4 border rounded-2xl max-h-96">{err.stack}</pre>
        </div>
      </Layout>
    );
  }
};

export default DeveloperRecruitment;