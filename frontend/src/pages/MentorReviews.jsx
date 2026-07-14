import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Award,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';

const MentorReviews = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Project for Review
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reviewsHistory, setReviewsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Review Form state
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState('approved'); // approved, rejected, resubmission_requested
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor/projects');
      if (res.data.status === 'success') {
        const projs = res.data.data.projects || [];
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load mentored projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsHistory = async (projId) => {
    if (!projId) return;
    try {
      setLoadingHistory(true);
      const res = await api.get(`/mentor/reviews/${projId}`);
      if (res.data.status === 'success') {
        setReviewsHistory(res.data.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchReviewsHistory(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || !selectedProjectId) return;

    setSubmitting(true);
    try {
      const res = await api.post('/mentor/reviews', {
        projectId: selectedProjectId,
        feedback,
        rating,
        milestoneStatus: status
      });

      if (res.data.status === 'success') {
        alert(`Milestone successfully reviewed & marked as ${status}!`);
        setFeedback('');
        setRating(5);
        setStatus('approved');
        fetchReviewsHistory(selectedProjectId);
      }
    } catch (err) {
      alert('Failed to submit milestone review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Loading Review Center...
        </div>
      </Layout>
    );
  }

  const activeProject = projects.find(p => p._id === selectedProjectId);

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-850 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Academic Review Desk
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <ClipboardCheck className="w-5 h-5 mr-2 text-brand-primary" />
              <span>Review Center</span>
            </h2>
            <p className="text-xs text-slate-550">
              Evaluate submitted student milestone documents, assign ratings, and award gamification reputation points.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450 text-xs font-semibold">
            No projects assigned to submit milestone reviews.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Review Submission Form */}
            <div className="lg:col-span-2 rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base">Submit Milestone Review</h3>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Select Huddle Project</label>
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
                    <label className="font-bold text-slate-450">Milestone Action Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                    >
                      <option value="approved">Approve milestone (+15 REP)</option>
                      <option value="rejected">Reject milestone</option>
                      <option value="resubmission_requested">Request resubmission adjustments</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-450">Milestone Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      className="bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none"
                    >
                      <option value={1}>1 Star</option>
                      <option value={2}>2 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={5}>5 Stars</option>
                    </select>
                  </div>

                  {activeProject && (
                    <div className="flex flex-col justify-end pb-2">
                      <span className="block text-[10px] text-slate-400">Project Owner</span>
                      <span className="block font-bold text-slate-700 mt-1">{activeProject.owner?.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-450">Review Feedback Notes</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify milestone comments or resubmission guidelines..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow">
                  {submitting ? 'Submitting review...' : 'Submit milestone review'}
                </button>
              </form>
            </div>

            {/* Right: Review history */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center">
                <Award className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Review History</span>
              </h3>

              {loadingHistory ? (
                <div className="py-8 text-center text-slate-400 animate-pulse font-mono">Syncing history...</div>
              ) : reviewsHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No milestone reviews on record for this project.</div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {reviewsHistory.map((rev) => (
                    <div key={rev._id} className="p-4 border rounded-2xl bg-slate-50/20 space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          rev.milestoneStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : rev.milestoneStatus === 'resubmission_requested' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {rev.milestoneStatus}
                        </span>
                        <span className="text-[10px] text-amber-500">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="text-[10px] text-slate-655 italic">" {rev.feedback} "</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 font-mono">
                        <span>By: {rev.mentorId?.name || user?.name}</span>
                        <span>{new Date(rev.createdAt || rev.reviewDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MentorReviews;
