import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  LayoutGrid,
  Users,
  Compass,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Detail states
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || '');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/projects/${id}`);
      if (res.data.status === 'success') {
        setProject(res.data.data.project);
      }
    } catch (err) {
      setError('Failed to fetch project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setApplyError('Please select a role to apply.');
      return;
    }

    setApplyLoading(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const res = await api.post(`/projects/${id}/apply`, {
        role: selectedRole,
        coverLetter,
        resumeUrl
      });

      if (res.data.status === 'success') {
        setApplySuccess('Application submitted successfully!');
        setTimeout(() => {
          setShowApplyModal(false);
          setApplySuccess('');
          setCoverLetter('');
          // Re-fetch project to update applied statuses
          fetchProjectDetails();
        }, 1500);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-slate-500 font-mono text-xs animate-pulse">
          Loading project specifications...
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="text-center py-20 text-brand-error text-xs font-bold space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p>{error || 'Project not found.'}</p>
          <button onClick={() => navigate(-1)} className="text-xs text-brand-primary font-bold hover:underline">
            Back to previous page
          </button>
        </div>
      </Layout>
    );
  }

  // Member checking
  const isOwner = project.owner?._id === user?._id || project.owner?._id === user?.id || project.owner === user?._id;
  const isMember = project.team?.members?.some(
    (m) => m.user === user?._id || m.user?._id === user?._id || m.user?._id === user?.id
  );

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-4xl mx-auto pb-12">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        {/* Project Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {project.category}
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                {project.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-xs text-slate-450 mt-1">
                <span className="flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1" />
                  Difficulty: <strong className="capitalize ml-1">{project.difficulty || 'Intermediate'}</strong>
                </span>
                <span className="flex items-center">
                  <Compass className="w-3.5 h-3.5 mr-1" />
                  Mode: <strong className="capitalize ml-1">{project.workMode || 'Remote'}</strong>
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Deadline: <strong className="ml-1">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</strong>
                </span>
              </div>
            </div>

            {/* Application button trigger */}
            {isOwner ? (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl">
                You own this project
              </span>
            ) : isMember ? (
              <Link
                to={`/teams/${project.team?._id || project.team}`}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow"
              >
                Open Huddle Workspace
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSelectedRole(project.rolesNeeded?.find(r => r.status === 'Open')?.roleName || '');
                  setShowApplyModal(true);
                }}
                className="px-5 py-3 bg-brand-primary hover:opacity-90 text-white font-bold rounded-xl text-xs shadow hover:scale-[1.01] transition-all"
              >
                Apply to Project
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-900">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">About the Project</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Required Skills */}
          {project.skillsRequired?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.skillsRequired.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl text-[10px] text-slate-500 font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Team Directories & Mentors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-900">
            {/* Team Members List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center">
                <Users className="w-4 h-4 mr-1 text-slate-450" />
                <span>Joined Teammates</span>
              </h4>

              {!project.team?.members || project.team.members.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center text-xs text-slate-400">
                  No teammates joined yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {project.team.members.map((m) => (
                    <Link
                      key={m.user?._id || m.user}
                      to={`/profile/${m.user?._id || m.user}`}
                      className="flex items-center space-x-2.5 p-2.5 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-brand-primary/20 bg-slate-50/20 dark:bg-slate-900/10 transition-all"
                    >
                      <img
                        src={getAvatarUrl(m.user?.avatar)}
                        alt={m.user?.name || 'Teammate'}
                        className="w-8 h-8 rounded-full object-cover border bg-slate-100"
                      />
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                          {m.user?.name || 'Teammate'}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize">
                          {m.role || 'Member'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mentor Assigned Section */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center">
                <GraduationCap className="w-4 h-4 mr-1 text-slate-450" />
                <span>Mentor Assigned</span>
              </h4>

              {!project.mentorId ? (
                <div className="p-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center text-xs text-slate-400">
                  No mentor assigned to this workspace yet.
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 p-3 border border-slate-200/60 dark:border-slate-850/60 rounded-2xl bg-brand-primary/5">
                  <img
                    src={getAvatarUrl(project.mentorId.avatar)}
                    alt={project.mentorId.name}
                    className="w-8 h-8 rounded-full object-cover border border-brand-primary/20 bg-slate-100"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-brand-primary">
                      {project.mentorId.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 capitalize">
                      Professional Guide
                    </span>
                  </div>
                </div>
              )}

              {/* Project Owner Card details */}
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center pt-3">
                <User className="w-4 h-4 mr-1 text-slate-450" />
                <span>Project Owner</span>
              </h4>
              <div className="flex items-center space-x-2.5 p-3 border border-slate-200/60 dark:border-slate-850/60 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10">
                <img
                  src={getAvatarUrl(project.owner?.avatar)}
                  alt={project.owner?.name}
                  className="w-8 h-8 rounded-full object-cover border bg-slate-100"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                    {project.owner?.name}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {project.owner?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Needed ledger */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base">Open Project Roles</h3>
          {!project.rolesNeeded || project.rolesNeeded.length === 0 ? (
            <div className="p-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center text-xs text-slate-400">
              No open roles defined.
            </div>
          ) : (
            <div className="space-y-3">
              {project.rolesNeeded.map((r, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10"
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      {r.roleName}
                    </span>
                    {r.skillsRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {r.skillsRequired.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[9px] text-slate-500"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      r.status === 'Open'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                    }`}
                  >
                    {r.status || 'Open'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* APPLY MODAL DIALOG */}
        <AnimatePresence>
          {showApplyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowApplyModal(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
              >
                <div>
                  <h3 className="font-extrabold text-base">Submit Workspace Application</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill out details to apply for a role in "{project.title}".
                  </p>
                </div>

                {applySuccess && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 rounded-xl text-xs font-semibold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>{applySuccess}</span>
                  </div>
                )}
                {applyError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/25 text-red-500 rounded-xl text-xs font-semibold flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>{applyError}</span>
                  </div>
                )}

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  {/* Select Role */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Target Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="">Select Role...</option>
                      {project.rolesNeeded
                        ?.filter((r) => r.status === 'Open')
                        .map((r, idx) => (
                          <option key={idx} value={r.roleName}>
                            {r.roleName}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Pre-filled Resume Url */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Resume / CV Link</label>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        className="bg-transparent border-none text-xs text-slate-900 dark:text-slate-200 w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Cover Letter / Cover Statement</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Why do you want to collaborate on this project? Highlight relevant skills..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-400 w-1/2 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applyLoading}
                      className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow w-1/2"
                    >
                      {applyLoading ? 'Submitting...' : 'Submit Application'}
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

export default ProjectDetails;
