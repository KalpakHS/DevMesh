import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Building,
  User,
  Info,
  Calendar,
  X,
  Plus
} from 'lucide-react';

const getCompanyLogoUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const DeveloperJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [salary, setSalary] = useState('');

  // Modals & Selected details
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Apply Form state
  const [coverLetter, setCoverLetter] = useState('');
  const [availability, setAvailability] = useState('Immediate');
  const [submittingApply, setSubmittingApply] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (company) params.append('company', company);
      if (skills) params.append('skills', skills);
      if (jobType) params.append('jobType', jobType);
      if (workMode) params.append('workMode', workMode);
      if (salary) params.append('salary', salary);

      const res = await api.get(`/users/jobs?${params.toString()}`);
      if (res.data.status === 'success') {
        setJobs(res.data.data.jobs || []);
      }

      // Load saved jobs to toggle bookmark highlights
      const savedRes = await api.get('/users/saved-jobs');
      if (savedRes.data.status === 'success') {
        setSavedJobs(savedRes.data.data.jobs.map(j => j._id) || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, company, skills, jobType, workMode, salary]);

  const handleToggleSave = async (jobId) => {
    try {
      const res = await api.post(`/users/jobs/${jobId}/save`);
      if (res.data.status === 'success') {
        if (res.data.isSaved) {
          setSavedJobs(prev => [...prev, jobId]);
          alert('Job saved successfully!');
        } else {
          setSavedJobs(prev => prev.filter(id => id !== jobId));
          alert('Job removed from saved.');
        }
      }
    } catch (err) {
      alert('Failed to update saved jobs list.');
    }
  };

  const handleOpenCompanyModal = async (recruiterId) => {
    setLoadingCompany(true);
    setCompanyModalOpen(true);
    try {
      const res = await api.get(`/users/recruiter-profile/${recruiterId}`);
      if (res.data.status === 'success') {
        setCompanyProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load company profile.');
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleFollowCompany = async (profileId) => {
    if (!profileId) return;
    try {
      const res = await api.post(`/users/companies/${profileId}/follow`);
      if (res.data.status === 'success') {
        alert(res.data.message);
        // Refresh company profile view
        if (companyProfile?.profile?._id === profileId) {
          const user = JSON.parse(localStorage.getItem('user'));
          setCompanyProfile(prev => {
            const hasFollower = prev.profile.followers.includes(user.id);
            const updatedFollowers = hasFollower
              ? prev.profile.followers.filter(id => id !== user.id)
              : [...prev.profile.followers, user.id];
            return {
              ...prev,
              profile: {
                ...prev.profile,
                followers: updatedFollowers
              }
            };
          });
        }
      }
    } catch (err) {
      alert('Failed to toggle follow status.');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    setSubmittingApply(true);
    try {
      const res = await api.post(`/users/jobs/${selectedJob._id}/apply`, {
        coverLetter,
        availability
      });
      if (res.data.status === 'success') {
        alert('Application submitted successfully!');
        setApplyModalOpen(false);
        setCoverLetter('');
        setAvailability('Immediate');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApply(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-3">
        {/* Header banner */}
        <div className="bg-slate-900 border border-slate-805 rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-indigo-400" />
            <span>Developer Jobs Marketplace</span>
          </h1>
          <p className="text-slate-300 mt-2 text-sm max-w-xl">
            Discover internships, full-time engineering roles, and part-time projects matching your REP. Apply instantly using your DevMesh verified profile.
          </p>
        </div>

        {/* Filters and search grids */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Filters sidebar */}
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Filter className="w-4 h-4 text-indigo-500" />
                <span>Refine Search</span>
              </span>
              <button
                onClick={() => {
                  setSearch('');
                  setCompany('');
                  setSkills('');
                  setJobType('');
                  setWorkMode('');
                  setSalary('');
                }}
                className="text-[10px] text-slate-400 font-bold hover:text-indigo-600 transition-colors uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>

            {/* Keyword search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Keyword Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Titles, description keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 w-full text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Google, Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl px-3 py-2 w-full text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Required Skills</label>
              <input
                type="text"
                placeholder="e.g. React, Docker"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl px-3 py-2 w-full text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Job Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Commitment Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl px-3 py-2 w-full text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              >
                <option value="" className="dark:bg-slate-950">All Commitments</option>
                <option value="Full Time" className="dark:bg-slate-950">Full Time</option>
                <option value="Internship" className="dark:bg-slate-950">Internship</option>
                <option value="Part Time" className="dark:bg-slate-950">Part Time</option>
                <option value="Contract" className="dark:bg-slate-950">Contract</option>
              </select>
            </div>

            {/* Work Mode */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Work Location Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl px-3 py-2 w-full text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              >
                <option value="" className="dark:bg-slate-950">All Modes</option>
                <option value="Remote" className="dark:bg-slate-950">Remote</option>
                <option value="Hybrid" className="dark:bg-slate-950">Hybrid</option>
                <option value="On-site" className="dark:bg-slate-950">On-site</option>
              </select>
            </div>
          </div>

          {/* Job listings feed */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-bold bg-white border rounded-3xl">
                Scanning marketplace jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold bg-white border border-dashed rounded-3xl">
                No active job opportunities match your criteria. Expand filters to discover more.
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const isSaved = savedJobs.includes(job._id);
                  return (
                    <div
                      key={job._id}
                      className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start space-x-3">
                          <img
                            src={getCompanyLogoUrl(job.companyLogo)}
                            alt="Logo"
                            className="w-12 h-12 rounded-xl object-cover border dark:border-slate-800"
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                              <Building className="w-3 h-3 mr-1" />
                              <span
                                onClick={() => handleOpenCompanyModal(job.recruiterId)}
                                className="hover:underline hover:text-indigo-600 cursor-pointer"
                              >
                                {job.company}
                              </span>
                            </span>
                            <h2
                              onClick={() => setSelectedJob(job)}
                              className="text-lg font-bold text-slate-800 dark:text-slate-200 hover:underline cursor-pointer"
                            >
                              {job.title}
                            </h2>
                          </div>
                        </div>

                        {/* Badges metadata row */}
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          <span className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 px-2 py-0.5 rounded flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-slate-450" />
                            {job.jobType}
                          </span>
                          <span className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 px-2 py-0.5 rounded flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-slate-450" />
                            {job.workMode} ({job.location})
                          </span>
                          {job.salary && (
                            <span className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded flex items-center">
                              <DollarSign className="w-3 h-3 mr-0.5" />
                              {job.salary}
                            </span>
                          )}
                        </div>

                        {/* Description snippet */}
                        <p className="text-slate-550 dark:text-slate-400 text-xs line-clamp-2">
                          {job.description}
                        </p>

                        {/* Skills requirements */}
                        {job.skillsRequired?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.skillsRequired.map((skill, idx) => (
                              <span key={idx} className="bg-indigo-50/50 text-indigo-600 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex md:flex-col justify-end items-end gap-3 self-center">
                        <button
                          onClick={() => handleToggleSave(job._id)}
                          className={`p-2.5 rounded-2xl border transition-colors ${
                            isSaved
                              ? 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-2xl font-bold text-xs flex items-center whitespace-nowrap transition-colors"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Job Drawer/Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 border-l dark:border-slate-800 w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Job Specification</span>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Job core details */}
                <div className="flex items-center space-x-3">
                  <img
                    src={getCompanyLogoUrl(selectedJob.companyLogo)}
                    alt="Logo"
                    className="w-14 h-14 rounded-2xl object-cover border dark:border-slate-800"
                  />
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{selectedJob.title}</h2>
                    <span
                      onClick={() => {
                        handleOpenCompanyModal(selectedJob.recruiterId);
                      }}
                      className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      {selectedJob.company}
                    </span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3 text-xs border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 rounded-2xl">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px]">Employment Type</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedJob.jobType}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px]">Location Preference</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedJob.workMode} ({selectedJob.location})</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px]">Package details</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedJob.salary || 'Competitive / Unspecified'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px]">Openings Available</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedJob.openings || 1} slots</span>
                  </div>
                </div>

                {/* Long description blocks */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Description</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-line leading-relaxed">
                      {selectedJob.description}
                    </p>
                  </div>
                  {selectedJob.responsibilities && (
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Responsibilities</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-line leading-relaxed">
                        {selectedJob.responsibilities}
                      </p>
                    </div>
                  )}
                  {selectedJob.eligibility && (
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Eligibility & Guidelines</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-line leading-relaxed">
                        {selectedJob.eligibility}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Action bar */}
              <div className="border-t dark:border-slate-805 pt-4 flex gap-3">
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-sm text-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Apply Now</span>
                </button>
                <button
                  onClick={() => handleToggleSave(selectedJob._id)}
                  className="px-4 py-3 border dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-xs"
                >
                  Save Listing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setApplyModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
              Apply to {selectedJob.company}
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              Submit your DevMesh credentials for the **{selectedJob.title}** position. Your verified profile resume, GitHub contributions, and HackerRank details will be automatically compiled.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Cover Letter / Pitch</label>
                <textarea
                  required
                  placeholder="Introduce yourself and explain why you're a great fit..."
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 rounded-2xl p-3 text-xs w-full text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 rounded-xl px-3 py-2 text-xs w-full text-slate-900 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Immediate" className="dark:bg-slate-950">Immediate Availability</option>
                  <option value="1 Month Notice" className="dark:bg-slate-950">1 Month Notice Period</option>
                  <option value="2 Months Notice" className="dark:bg-slate-950">2 Months Notice Period</option>
                  <option value="Currently Studying" className="dark:bg-slate-950">Currently Studying / Part-Time</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingApply}
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {submittingApply ? 'Submitting Sourcing Application...' : 'Send Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Company Modal overlay */}
      {companyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setCompanyModalOpen(false);
                setCompanyProfile(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingCompany || !companyProfile ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                Retrieving company details...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Banner & Logo */}
                <div className="relative">
                  <div className="h-32 w-full bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border dark:border-slate-800">
                    {companyProfile.profile.banner ? (
                      <img src={getCompanyLogoUrl(companyProfile.profile.banner)} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-slate-800 to-indigo-900" />
                    )}
                  </div>
                  <img
                    src={getCompanyLogoUrl(companyProfile.profile.companyLogo)}
                    alt="Logo"
                    className="w-16 h-16 rounded-2xl border dark:border-slate-800 object-cover absolute bottom-2 left-4 shadow-md bg-white dark:bg-slate-900"
                  />
                </div>

                {/* Org header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{companyProfile.profile.company || 'DevMesh Partner'}</h3>
                    <span className="text-xs text-slate-400 font-bold block">{companyProfile.profile.industry || 'Technology Sector'}</span>
                  </div>
                  <button
                    onClick={() => handleFollowCompany(companyProfile.profile._id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      companyProfile.profile.followers?.includes(JSON.parse(localStorage.getItem('user'))?.id)
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        : 'bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                    }`}
                  >
                    {companyProfile.profile.followers?.includes(JSON.parse(localStorage.getItem('user'))?.id) ? 'Following' : 'Follow Company'}
                  </button>
                </div>

                {/* Attributes grid */}
                <div className="grid grid-cols-3 gap-3 text-[10px] text-center border-y dark:border-slate-800 py-3 font-bold text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-slate-450 uppercase text-[8px]">Employees</span>
                    <span>{companyProfile.profile.employees || '50 - 150'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-450 uppercase text-[8px]">Locations</span>
                    <span>{companyProfile.profile.locations?.join(', ') || 'Remote / Hybrid'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-450 uppercase text-[8px]">Followers</span>
                    <span>{companyProfile.profile.followers?.length || 0} dev members</span>
                  </div>
                </div>

                {/* Cultural statements */}
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">About Organization</h4>
                    <p className="text-slate-655 dark:text-slate-400 mt-1">{companyProfile.profile.about || 'Technology organization hiring via DevMesh.'}</p>
                  </div>
                  {companyProfile.profile.culture && (
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Culture & Work Values</h4>
                      <p className="text-slate-655 dark:text-slate-400 mt-1">{companyProfile.profile.culture}</p>
                    </div>
                  )}
                  {companyProfile.profile.benefits && (
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Benefits & Perks</h4>
                      <p className="text-slate-655 dark:text-slate-400 mt-1">{companyProfile.profile.benefits}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DeveloperJobs;
