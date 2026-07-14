import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const MentorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending'); // Pending, Accepted, Rejected, Withdrawn
  const { socket } = useSocket();

  // Reapply modal state
  const [selectedAppForReapply, setSelectedAppForReapply] = useState(null);
  const [coverMessage, setCoverMessage] = useState('');
  const [expertise, setExpertise] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [expectedContribution, setExpectedContribution] = useState('');
  const [submittingReapply, setSubmittingReapply] = useState(false);

  // Project preview modal state
  const [previewProject, setPreviewProject] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor/applications');
      if (res.data.status === 'success') {
        setApplications(res.data.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchApplications();
    };
    socket.on('notification_received', handleRefresh);
    return () => {
      socket.off('notification_received', handleRefresh);
    };
  }, [socket]);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await api.put(`/mentor/applications/${applicationId}/withdraw`);
      if (res.data.status === 'success') {
        alert('Application withdrawn.');
        fetchApplications();
      }
    } catch (err) {
      alert('Failed to withdraw application.');
    }
  };

  const handleReapply = async (e) => {
    e.preventDefault();
    if (!selectedAppForReapply) return;

    setSubmittingReapply(true);
    try {
      const res = await api.post(`/mentor/applications/${selectedAppForReapply._id}/reapply`, {
        message: coverMessage,
        expertise,
        experience,
        availability,
        expectedContribution
      });

      if (res.data.status === 'success') {
        alert('Successfully reapplied to the project!');
        setSelectedAppForReapply(null);
        setCoverMessage('');
        setExpertise('');
        setExperience('');
        setAvailability('');
        setExpectedContribution('');
        fetchApplications();
      }
    } catch (err) {
      alert('Failed to reapply to project.');
    } finally {
      setSubmittingReapply(false);
    }
  };

  const openReapplyModal = (app) => {
    setSelectedAppForReapply(app);
    setCoverMessage(app.message || '');
    setExpertise(app.expertise || '');
    setExperience(app.experience || '');
    setAvailability(app.availability || '');
    setExpectedContribution(app.expectedContribution || '');
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing mentor applications desk...
        </div>
      </Layout>
    );
  }

  // Filter list by tab
  const tabApplications = applications.filter(app => app.status === activeTab);

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-850 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-505 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Applications Tracker
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Mentor Applications</span>
            </h2>
            <p className="text-xs text-slate-550">
              Track the status of your submitted project cover applications, manage withdrawals, or reapply to open projects.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-1.5 pb-2 border-b">
          {[
            { id: 'Pending', label: 'Pending Applications', icon: Clock },
            { id: 'Accepted', label: 'Accepted', icon: CheckCircle },
            { id: 'Rejected', label: 'Rejected', icon: XCircle },
            { id: 'Withdrawn', label: 'Withdrawn', icon: AlertCircle }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold border transition-all ${
                  activeTab === t.id
                    ? 'bg-slate-900 text-white border-transparent'
                    : 'bg-white text-slate-550 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label} ({applications.filter(app => app.status === t.id).length})</span>
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        {tabApplications.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 font-semibold bg-white shadow-sm">
            No applications found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tabApplications.map((app) => (
              <div key={app._id} className="rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="bg-brand-primary/10 text-brand-primary border px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {app.projectId?.category || 'Project'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">{app.projectId?.title}</h4>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Owner: {app.projectId?.owner?.name}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded-2xl space-y-1">
                    <span className="block font-bold text-slate-450 text-[8px] uppercase">Cover Message</span>
                    <p className="text-slate-655 italic">"{app.message}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 pt-1">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[8px]">Availability</span>
                      <span className="font-semibold text-slate-700">{app.availability || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[8px]">Expected Contribution</span>
                      <span className="font-semibold text-slate-700 block truncate">{app.expectedContribution || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Rejection Reason display */}
                  {app.status === 'Rejected' && app.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-2xl space-y-1 text-red-700">
                      <span className="block font-bold text-red-500 text-[8px] uppercase">Rejection Reason</span>
                      <p className="italic">"{app.rejectionReason}"</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setPreviewProject(app.projectId)}
                    className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-bold flex items-center justify-center space-x-1.5 w-1/2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Project</span>
                  </button>

                  {app.status === 'Pending' && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors w-1/2 text-center"
                    >
                      Withdraw
                    </button>
                  )}

                  {app.status === 'Accepted' && (
                    <a
                      href="/mentor/projects"
                      className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors w-1/2 text-center block"
                    >
                      Open Workspace
                    </a>
                  )}

                  {(app.status === 'Rejected' || app.status === 'Withdrawn') && (
                    <button
                      onClick={() => openReapplyModal(app)}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors w-1/2 text-center flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reapply</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REAPPLY MODAL */}
        <AnimatePresence>
          {selectedAppForReapply && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setSelectedAppForReapply(null)} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <h3 className="font-extrabold text-base">Reapply as Project Mentor</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Project: {selectedAppForReapply.projectId?.title}</p>
                </div>

                <form onSubmit={handleReapply} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Cover Message</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Why do you want to mentor this team?"
                      value={coverMessage}
                      onChange={(e) => setCoverMessage(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Expertise / Domain</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Machine Learning, React Architect"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Experience Specs</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 Years Senior ML Engineer"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Availability</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 hours/week, weekends"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Expected Contribution</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Specify your contributions..."
                      value={expectedContribution}
                      onChange={(e) => setExpectedContribution(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAppForReapply(null)}
                      className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 w-1/2 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReapply}
                      className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2"
                    >
                      {submittingReapply ? 'Submitting...' : 'Resubmit Application'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PROJECT PREVIEW MODAL */}
        <AnimatePresence>
          {previewProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={() => setPreviewProject(null)} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-4 text-left text-xs"
              >
                <div>
                  <span className="bg-brand-primary/10 text-brand-primary border px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {previewProject.category}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-800 mt-2">{previewProject.title}</h3>
                </div>

                <div className="space-y-1">
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">Description</span>
                  <p className="text-slate-655 leading-relaxed">{previewProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Tech Stack</span>
                    <div className="flex flex-wrap gap-1">
                      {previewProject.skills?.map((s, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[9px]">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-bold uppercase text-[9px]">Owner details</span>
                    <span className="block font-bold text-slate-700 mt-1">{previewProject.owner?.name}</span>
                    <span className="block text-[9px] text-slate-400">{previewProject.owner?.email}</span>
                  </div>
                </div>

                <div className="pt-4 border-t text-right">
                  <button
                    onClick={() => setPreviewProject(null)}
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

export default MentorApplications;
