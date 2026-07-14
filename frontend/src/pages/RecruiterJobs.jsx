import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  X,
  FileText,
  Calendar,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // jobs, applications

  // New Job Form Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [workMode, setWorkMode] = useState('Remote');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [deadline, setDeadline] = useState('');
  const [openings, setOpenings] = useState(1);
  const [submittingJob, setSubmittingJob] = useState(false);

  // Application details modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchJobsAndApplications = async () => {
    try {
      setLoading(true);
      const jobsRes = await api.get('/recruiter/jobs');
      if (jobsRes.data.status === 'success') {
        setJobs(jobsRes.data.data.jobs || []);
      }

      const appsRes = await api.get('/recruiter/applications');
      if (appsRes.data.status === 'success') {
        setApplications(appsRes.data.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load recruiter listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndApplications();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSubmittingJob(true);
    try {
      const skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/recruiter/jobs', {
        title,
        company,
        companyLogo,
        jobType,
        workMode,
        location,
        salary,
        experienceRequired,
        skillsRequired: skillsArray,
        description,
        responsibilities,
        eligibility,
        deadline: deadline || undefined,
        openings
      });
      if (res.data.status === 'success') {
        alert('Job opportunity posted successfully!');
        setCreateModalOpen(false);
        // Reset states
        setTitle('');
        setCompany('');
        setCompanyLogo('');
        setJobType('Full Time');
        setWorkMode('Remote');
        setLocation('');
        setSalary('');
        setExperienceRequired('');
        setSkillsRequired('');
        setDescription('');
        setResponsibilities('');
        setEligibility('');
        setDeadline('');
        setOpenings(1);

        fetchJobsAndApplications();
      }
    } catch (err) {
      alert('Failed to post job. Please check all required parameters.');
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/recruiter/applications/${appId}/status`, { status: newStatus });
      if (res.data.status === 'success') {
        alert(`Candidate status updated to: ${newStatus}`);
        if (selectedApp?._id === appId) {
          setSelectedApp(prev => ({ ...prev, status: newStatus }));
        }
        fetchJobsAndApplications();
      }
    } catch (err) {
      alert('Failed to update pipeline stage.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job listing?')) return;
    try {
      const res = await api.delete(`/recruiter/jobs/${jobId}`);
      if (res.data.status === 'success') {
        alert('Job requisition closed successfully.');
        fetchJobsAndApplications();
      }
    } catch (err) {
      alert('Failed to close job listing.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-3">
        {/* Recruiter Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-indigo-400" />
              <span>Jobs & Requisitions Portal</span>
            </h1>
            <p className="text-slate-450 mt-2 text-sm max-w-xl">
              Post open roles, manage job descriptions, evaluate applicants, and track candidate pipeline progress.
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Posting</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b text-sm font-bold text-slate-450">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 px-4 border-b-2 transition-all ${
              activeTab === 'jobs' ? 'border-indigo-600 text-slate-850' : 'border-transparent hover:text-slate-650'
            }`}
          >
            Posted Requisitions ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-4 border-b-2 transition-all ${
              activeTab === 'applications' ? 'border-indigo-600 text-slate-850' : 'border-transparent hover:text-slate-650'
            }`}
          >
            Incoming Applications ({applications.length})
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold bg-white border rounded-3xl">
            Loading requisitions & applicants details...
          </div>
        ) : activeTab === 'jobs' ? (
          /* Jobs list */
          jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold bg-white border border-dashed rounded-3xl">
              You haven't posted any job listings yet. Click "Create Job Posting" to recruit developers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const jobApps = applications.filter((app) => app.jobId?._id === job._id);
                return (
                  <div key={job._id} className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <img
                            src={job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=80'}
                            alt="Logo"
                            className="w-10 h-10 rounded-xl object-cover border"
                          />
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{job.company}</span>
                            <h3 className="font-bold text-slate-800 text-base leading-tight">{job.title}</h3>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          job.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-1">
                        <span className="flex items-center bg-slate-50 px-2 py-0.5 rounded border">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {job.jobType}
                        </span>
                        <span className="flex items-center bg-slate-50 px-2 py-0.5 rounded border">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {job.workMode} ({job.location})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4 text-xs font-bold">
                      <span className="text-slate-500 flex items-center">
                        <Users className="w-4 h-4 mr-1 text-indigo-500" />
                        <span>{jobApps.length} Applicants</span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('applications');
                          }}
                          className="text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          View Candidates
                        </button>
                        <button
                          onClick={() => handleCloseJob(job._id)}
                          className="text-red-650 hover:text-red-700 bg-red-50/50 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Close Job
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Applications list */
          applications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold bg-white border border-dashed rounded-3xl">
              No developer applications have been submitted to your job openings yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={getAvatarUrl(app.developerId?.avatar)}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-800 text-sm">{app.developerId?.name}</span>
                        <span className="bg-indigo-50 text-indigo-650 px-1.5 py-0.5 rounded font-extrabold text-[8px]">
                          {app.developerId?.reputation || 0} REP
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{app.developerId?.college || 'DevMesh Candidate'}</span>
                      <span className="text-[10px] text-slate-500 font-bold mt-1 block">
                        Applied for: <span className="text-indigo-605">{app.jobId?.title}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status & Options */}
                  <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                      app.status === 'Applied' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                      app.status === 'Shortlisted' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                      app.status === 'Interview' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                      app.status === 'Selected' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      'bg-red-50 border-red-100 text-red-650'
                    }`}>
                      {app.status}
                    </span>

                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-xs font-bold text-indigo-650 bg-slate-50 hover:bg-slate-100 border px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Evaluate Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Post a Job Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-800">
              Create a Job Listing
            </h2>

            <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Job Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lead React Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Company Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Company Logo URL</label>
                <input
                  type="text"
                  placeholder="Logo URL path"
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Commitment *</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Work Mode *</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Location *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Salary Range / Stipend</label>
                <input
                  type="text"
                  placeholder="e.g. $120,000 - $140,000 / year"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Experience Required</label>
                <input
                  type="text"
                  placeholder="e.g. 2+ years"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Express"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Description *</label>
                <textarea
                  required
                  placeholder="Describe the job vacancy in detail..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border rounded-xl p-3 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Responsibilities</label>
                <textarea
                  placeholder="Bullet point list of responsibilities..."
                  rows={3}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="border rounded-xl p-3 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Eligibility Guidelines</label>
                <textarea
                  placeholder="e.g. Must be located in USA, CS Degree or equivalent..."
                  rows={2}
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="border rounded-xl p-3 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Open Requisitions Slots</label>
                <input
                  type="number"
                  min={1}
                  value={openings}
                  onChange={(e) => setOpenings(parseInt(e.target.value))}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingJob}
                className="md:col-span-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
              >
                {submittingJob ? 'Saving Job Posting Requisition...' : 'Publish Job Requisition'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Evaluate Candidate Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-800">
              Evaluate Candidate
            </h2>

            {/* Candidate Header */}
            <div className="flex items-center space-x-3 border-b pb-4">
              <img
                src={getAvatarUrl(selectedApp.developerId?.avatar)}
                alt="Avatar"
                className="w-14 h-14 rounded-full border object-cover"
              />
              <div>
                <h3 className="font-extrabold text-slate-850 text-lg leading-none">{selectedApp.developerId?.name}</h3>
                <span className="text-xs text-slate-400">{selectedApp.developerId?.college}</span>
                <div className="flex gap-2 mt-1">
                  <span className="bg-indigo-50 text-indigo-650 px-1.5 py-0.5 rounded font-extrabold text-[8px]">
                    {selectedApp.developerId?.reputation || 0} REP
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-extrabold text-[8px]">
                    {selectedApp.developerId?.hiringStatus || 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Application details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-slate-450 font-bold uppercase text-[9px]">Sourcing Preferences</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <span className="bg-slate-50 border p-2 rounded-xl">Notice Period: <b>{selectedApp.developerId?.noticePeriod || 'None'}</b></span>
                  <span className="bg-slate-50 border p-2 rounded-xl">Expected Salary: <b>{selectedApp.developerId?.expectedSalary || 'Competitive'}</b></span>
                </div>
              </div>

              <div>
                <span className="block text-slate-450 font-bold uppercase text-[9px]">Cover Letter / Pitch</span>
                <p className="bg-slate-50 p-3 rounded-2xl text-slate-600 leading-relaxed mt-1">
                  {selectedApp.coverLetter || 'No cover letter uploaded.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedApp.resume && (
                  <a
                    href={selectedApp.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between border bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl text-slate-700 font-bold"
                  >
                    <span>Download CV / Resume</span>
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </a>
                )}
                {selectedApp.github && (
                  <a
                    href={selectedApp.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between border bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl text-slate-700 font-bold"
                  >
                    <span>View GitHub Profile</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Pipeline stages controls */}
            <div className="border-t pt-4 space-y-3">
              <span className="block text-slate-450 font-bold uppercase text-[9px]">Advance Candidate Pipeline Stage</span>
              <div className="grid grid-cols-5 gap-1.5">
                {['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((stage) => (
                  <button
                    key={stage}
                    onClick={() => handleUpdateAppStatus(selectedApp._id, stage)}
                    disabled={updatingStatus}
                    className={`py-2 rounded-xl text-[10px] font-bold border transition-colors ${
                      selectedApp.status === stage
                        ? 'bg-indigo-650 border-indigo-700 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RecruiterJobs;
