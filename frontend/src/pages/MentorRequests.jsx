import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Clock,
  Code,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const MentorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const [previewRequest, setPreviewRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor/requests');
      if (res.data.status === 'success') {
        setRequests(res.data.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load mentor requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchRequests();
    };
    socket.on('notification_received', handleRefresh);
    return () => {
      socket.off('notification_received', handleRefresh);
    };
  }, [socket]);

  const handleResolveRequest = async (requestId, action) => {
    try {
      const res = await api.put(`/mentor-requests/${requestId}/status`, { status: action });
      if (res.data.status === 'success') {
        alert(`Request successfully ${action.toLowerCase()}ed!`);
        fetchRequests();
        setPreviewRequest(null);
      }
    } catch (err) {
      alert('Failed to resolve request.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing incoming huddle requests...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
        {/* Banner Header */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-850 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Request Desk
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5">
              Mentor Requests
            </h2>
            <p className="text-xs text-slate-550">
              Evaluate student project details, view required tech stacks, and resolve acceptances.
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 text-xs font-semibold">
            No mentor requests found in your ledger.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Requests list */}
            <div className="lg:col-span-2 space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="rounded-3xl border bg-white p-5 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-800">
                        {req.projectId?.title || 'Unknown Project'}
                      </h4>
                      <span className="text-[10px] text-slate-400">Owner: {req.senderId?.name}</span>
                    </div>
                    <span className="bg-indigo-50 border px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {req.projectId?.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-555 line-clamp-3 leading-relaxed">
                    {req.projectId?.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-[10px]">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase">Team Size</span>
                      <span className="font-semibold text-slate-700 flex items-center mt-0.5">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {req.projectId?.members?.length + 1 || 1} Members
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase">Tech Stack</span>
                      <span className="font-semibold text-slate-700 flex items-center mt-0.5">
                        <Code className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {req.projectId?.skills?.slice(0, 2).join(', ') || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase">Duration</span>
                      <span className="font-semibold text-slate-700 flex items-center mt-0.5">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {req.projectId?.duration || '1 Month'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase">Requested Date</span>
                      <span className="font-semibold text-slate-700 flex items-center mt-0.5">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="font-mono text-[10px] text-slate-455">
                      Status: <strong className={req.status === 'Pending' ? 'text-amber-500' : req.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'}>{req.status}</strong>
                    </span>

                    <div className="space-x-2">
                      <button
                        onClick={() => setPreviewRequest(req)}
                        className="px-3.5 py-1.5 border rounded-lg font-bold hover:bg-slate-50"
                      >
                        View Details
                      </button>
                      {req.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleResolveRequest(req._id, 'Rejected')}
                            className="px-3.5 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-bold"
                          >
                            Reject Request
                          </button>
                          <button
                            onClick={() => handleResolveRequest(req._id, 'Accepted')}
                            className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-lg hover:opacity-90 font-bold"
                          >
                            Accept Request
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Request Sidebar Details */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-base flex items-center">
                <Inbox className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Request Preview</span>
              </h3>

              {!previewRequest ? (
                <div className="py-12 text-center text-slate-400 italic">
                  Select a request to preview complete specifications.
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div>
                    <h4 className="font-bold text-sm">{previewRequest.projectId?.title}</h4>
                    <span className="text-[10px] text-slate-400">Category: {previewRequest.projectId?.category}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Description</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {previewRequest.projectId?.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Requested Message</span>
                    <div className="p-3 bg-indigo-50/50 border rounded-xl italic text-slate-550 text-[10px]">
                      " {previewRequest.message || 'No written message provided.'} "
                    </div>
                  </div>

                  {previewRequest.status === 'Pending' && (
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <button
                        onClick={() => handleResolveRequest(previewRequest._id, 'Rejected')}
                        className="py-2 border border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50 text-center"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleResolveRequest(previewRequest._id, 'Accepted')}
                        className="py-2 bg-emerald-500 text-white rounded-xl font-bold hover:opacity-90 text-center"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MentorRequests;
