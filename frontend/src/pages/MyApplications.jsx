import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Trash2,
  MailOpen,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cover letter dialog
  const [viewLetterApp, setViewLetterApp] = useState(null);

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch outgoing applications
      const appRes = await api.get('/users/my-applications');
      if (appRes.data.status === 'success') {
        setApplications(appRes.data.data.applications || []);
      }

      // 2. Fetch incoming invitations from notifications model
      const notiRes = await api.get('/notifications');
      if (notiRes.data.status === 'success') {
        const inviteNotis = notiRes.data.data.notifications?.filter(
          (n) => n.type === 'Invitation' || n.title?.toLowerCase().includes('invite')
        ) || [];
        setInvitations(inviteNotis);
      }
    } catch (err) {
      console.error('Failed to load applications data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsData();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!confirm('Are you sure you want to withdraw this application? This is irreversible.')) {
      return;
    }
    try {
      const res = await api.delete(`/projects/applications/${appId}`);
      if (res.data.status === 'success') {
        setApplications(prev => prev.filter((a) => a._id !== appId));
      }
    } catch (err) {
      alert('Failed to withdraw application.');
    }
  };

  const handleResolveInvite = async (notiId, action) => {
    try {
      const res = await api.post(`/teams/invitations/${notiId}/${action}`);
      if (res.data.status === 'success') {
        setInvitations(prev => prev.filter((i) => i._id !== notiId));
        // Re-fetch to show joined workspace in active huddles
        fetchApplicationsData();
      }
    } catch (err) {
      // Local fallback sync
      setInvitations(prev => prev.filter((i) => i._id !== notiId));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-slate-500 font-mono text-xs animate-pulse">
          Loading applications logs...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 text-left max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Applications Tracking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track status updates for outgoing applications and manage incoming project huddle invitations.
          </p>
        </div>

        {/* Incoming Invitations List */}
        {invitations.length > 0 && (
          <div className="rounded-3xl border border-brand-primary/20 bg-brand-primary/5 p-6 space-y-4">
            <h3 className="font-extrabold text-base flex items-center text-brand-primary">
              <MailOpen className="w-5 h-5 mr-2" />
              <span>Workspace Invitations ({invitations.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((invite) => (
                <div
                  key={invite._id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1.5 text-left">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      Recruiter / Owner Invite
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {invite.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {invite.message}
                    </p>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleResolveInvite(invite._id, 'reject')}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-400 w-1/2"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleResolveInvite(invite._id, 'accept')}
                      className="px-4 py-2 bg-brand-primary hover:opacity-90 text-white rounded-xl text-xs font-bold shadow w-1/2"
                    >
                      Accept & Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing Applications List */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-base flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-slate-450" />
            <span>Submitted Applications ({applications.length})</span>
          </h3>

          {applications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-350 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              <ClipboardList className="w-8 h-8 text-slate-400" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">No Applications Submitted</h4>
                <p className="text-xs text-slate-500">
                  Find interesting projects in the marketplace and apply!
                </p>
              </div>
              <Link
                to="/marketplace"
                className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs shadow"
              >
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const status = app.status || 'Pending';
                const isPending = status.toLowerCase() === 'pending';
                const isAccepted = status.toLowerCase() === 'accepted';
                const isRejected = status.toLowerCase() === 'rejected';

                return (
                  <div
                    key={app._id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                  >
                    {/* Left: Project title, details */}
                    <div className="space-y-3 text-left md:w-1/2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="inline-block text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full uppercase">
                          {app.project?.category || 'Development'}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                          {app.project?.title || 'Project Details'}
                        </h4>
                        <div className="text-xs text-slate-450">
                          Role: <strong className="text-slate-650 dark:text-slate-300 font-semibold">{app.role}</strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-3 text-[11px] text-slate-400">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        {app.coverLetter && (
                          <button
                            onClick={() => setViewLetterApp(app)}
                            className="flex items-center text-brand-primary font-bold hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            <span>Preview Cover Letter</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle: Timeline track */}
                    <div className="flex items-center space-x-6 md:w-1/3 text-xs">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <span className="text-[10px] text-slate-450 mt-1">Submitted</span>
                      </div>
                      <div className="w-10 h-0.5 bg-emerald-500" />

                      {/* Step 2 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                          isAccepted || isRejected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-brand-primary text-white border border-brand-primary animate-pulse'
                        }`}>
                          {isAccepted || isRejected ? '✓' : '•'}
                        </div>
                        <span className="text-[10px] text-slate-450 mt-1">Reviewed</span>
                      </div>
                      <div className={`w-10 h-0.5 ${isAccepted ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

                      {/* Step 3 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white ${
                          isAccepted
                            ? 'bg-emerald-500'
                            : isRejected
                            ? 'bg-red-500'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {isAccepted ? '✓' : isRejected ? '✗' : '?'}
                        </div>
                        <span className="text-[10px] text-slate-450 mt-1">Decided</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col justify-center items-end gap-2">
                      <div className="flex items-center space-x-1.5">
                        {isAccepted && (
                          <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Accepted</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center space-x-1 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Rejected</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>Under Review</span>
                          </span>
                        )}
                      </div>

                      {/* Detail navigation */}
                      <div className="flex gap-2 mt-2">
                        <Link
                          to={`/projects/${app.project?._id || app.project}`}
                          className="px-3.5 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-[10px] font-bold text-slate-650 dark:text-slate-400"
                        >
                          View Details
                        </Link>

                        {isPending && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            className="p-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 rounded-xl"
                            title="Withdraw Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {isAccepted && app.project?.team && (
                          <Link
                            to={`/teams/${app.project.team?._id || app.project.team}`}
                            className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl text-[10px] shadow"
                          >
                            Enter Workspace
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COVER LETTER PREVIEW DIALOG */}
        <AnimatePresence>
          {viewLetterApp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewLetterApp(null)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                  <h3 className="font-extrabold text-base">Cover Letter Preview</h3>
                  <button
                    onClick={() => setViewLetterApp(null)}
                    className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">
                    Role: {viewLetterApp.role}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {viewLetterApp.coverLetter}
                  </div>
                  {viewLetterApp.resumeUrl && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400">Attached Resume URL:</span>
                      <a
                        href={viewLetterApp.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs font-semibold text-brand-primary hover:underline break-all mt-0.5"
                      >
                        {viewLetterApp.resumeUrl}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MyApplications;
