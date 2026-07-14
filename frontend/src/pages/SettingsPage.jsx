import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { Settings, Save, User, Laptop, Globe, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { user, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Tab state: 'profile' or 'preferences'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile forms state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [college, setCollege] = useState(user?.college || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(user?.availabilityStatus || 'available');
  
  // Convert skills & techStack arrays to comma-separated strings for easy input editing
  const [skillsStr, setSkillsStr] = useState(user?.skills?.join(', ') || '');
  const [techStackStr, setTechStackStr] = useState(user?.techStack?.join(', ') || '');

  const [github, setGithub] = useState(user?.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [website, setWebsite] = useState(user?.socialLinks?.website || '');

  // Recruitment Sourcing states
  const [openToRecruiters, setOpenToRecruiters] = useState(user?.openToRecruiters !== undefined ? user.openToRecruiters : true);
  const [hideProfileFromRecruiters, setHideProfileFromRecruiters] = useState(user?.hideProfileFromRecruiters || false);
  const [availableForInternships, setAvailableForInternships] = useState(user?.availableForInternships || false);
  const [availableForFullTime, setAvailableForFullTime] = useState(user?.availableForFullTime || false);
  const [preferredJobRole, setPreferredJobRole] = useState(user?.preferredJobRole || '');
  const [preferredLocation, setPreferredLocation] = useState(user?.preferredLocation || '');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status handlers
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.status === 'success') {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    // Parse comma strings back to clean arrays
    const skillsArray = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const techStackArray = techStackStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const socialLinksObj = {
      github: github.trim(),
      linkedin: linkedin.trim(),
      website: website.trim()
    };

    try {
      const res = await api.put('/users/profile', {
        name,
        bio,
        college,
        availabilityStatus,
        skills: skillsArray,
        techStack: techStackArray,
        socialLinks: socialLinksObj
      });

      if (res.data.status === 'success') {
        updateUserProfile(res.data.data.user);
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-2xl mx-auto pb-12">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Account Control Center</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure developer profile metadata, social links, and appearance preferences.
          </p>
        </div>

        {/* Action alerts */}
        {success && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 rounded-xl text-xs font-semibold flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/25 text-red-500 rounded-xl text-xs font-semibold flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex space-x-2 border-b border-slate-100 dark:border-slate-900 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Edit Profile details
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'preferences'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-50'
            }`}
          >
            System Preferences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Security Settings
          </button>
        </div>

        {/* TAB 1: EDIT PROFILE FORM */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-base">Edit Developer Profile</h3>
            </div>

            {/* Name & College */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400">College / Institution</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Biography Statement</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell other builders about yourself..."
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Availability Status */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Availability Status</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              >
                <option value="available">Available to Collaborations</option>
                <option value="busy">Busy / Active on Sprints</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Skills & Tech Stack arrays inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Git, Docker, Kubernetes, TDD"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Mongoose, Express"
                  value={techStackStr}
                  onChange={(e) => setTechStackStr(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Social Handles */}
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-900">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-450">Social & Web Links</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-450">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-450">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-450">Portfolio Website</label>
                  <input
                    type="url"
                    placeholder="https://mywebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 shadow transition-all w-full pt-3"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{loading ? 'Saving adjustments...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: SYSTEM PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-2">
              <Laptop className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-base">System Appearance Settings</h3>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs">
              <div className="text-left space-y-1">
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  Dark / Light Mode Preference
                </span>
                <span className="block text-[10px] text-slate-400">
                  Toggle application background variables.
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-sm text-xs font-bold hover:bg-slate-50 transition-all"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4.5 h-4.5 text-amber-500" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Career Sourcing Settings */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setSuccess('');
              setError('');
              try {
                const res = await api.put('/users/recruitment-settings', {
                  openToRecruiters,
                  hideProfileFromRecruiters,
                  availableForInternships,
                  availableForFullTime,
                  preferredJobRole,
                  preferredLocation
                });
                if (res.data.status === 'success') {
                  updateUserProfile(res.data.data.user);
                  setSuccess('Recruitment settings saved successfully!');
                }
              } catch (err) {
                setError('Failed to save recruitment preferences.');
              } finally {
                setLoading(false);
              }
            }} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4 mt-6 text-left">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-base">Career Sourcing Preferences</h3>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/40">
                <div>
                  <span className="block font-bold text-slate-800 dark:text-slate-200">Open to Recruiters Outreach</span>
                  <span className="block text-[10px] text-slate-400">Allow recruiters to discover your profile</span>
                </div>
                <input
                  type="checkbox"
                  checked={openToRecruiters}
                  onChange={(e) => setOpenToRecruiters(e.target.checked)}
                  className="w-4 h-4 accent-brand-primary cursor-pointer animate-none bg-transparent"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/40">
                <div>
                  <span className="block font-bold text-slate-800 dark:text-slate-200">Hide Profile Search Visibility</span>
                  <span className="block text-[10px] text-slate-400">Anonymize your candidacy search metrics</span>
                </div>
                <input
                  type="checkbox"
                  checked={hideProfileFromRecruiters}
                  onChange={(e) => setHideProfileFromRecruiters(e.target.checked)}
                  className="w-4 h-4 accent-brand-primary cursor-pointer animate-none bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/40">
                  <span className="font-bold text-slate-700 dark:text-slate-350">Internships</span>
                  <input
                    type="checkbox"
                    checked={availableForInternships}
                    onChange={(e) => setAvailableForInternships(e.target.checked)}
                    className="w-4 h-4 accent-brand-primary cursor-pointer animate-none bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/40">
                  <span className="font-bold text-slate-700 dark:text-slate-350">Full-Time Job</span>
                  <input
                    type="checkbox"
                    checked={availableForFullTime}
                    onChange={(e) => setAvailableForFullTime(e.target.checked)}
                    className="w-4 h-4 accent-brand-primary cursor-pointer animate-none bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Preferred Job Position</span>
                <input
                  type="text"
                  placeholder="e.g. Fullstack Engineer, DevOps Architect..."
                  value={preferredJobRole}
                  onChange={(e) => setPreferredJobRole(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Preferred Location / Remote preference</span>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Remote, San Francisco..."
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <Save className="w-4.5 h-4.5" />
                <span>{loading ? 'Saving adjustments...' : 'Save Career Settings'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SECURITY SETTINGS */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-base">Change Password</h3>
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 shadow transition-all w-full pt-3"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{loading ? 'Updating password...' : 'Update Password'}</span>
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;
