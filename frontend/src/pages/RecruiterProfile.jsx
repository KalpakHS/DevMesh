import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Globe,
  Linkedin,
  MapPin,
  Save,
  Building,
  Info
} from 'lucide-react';

const RecruiterProfile = () => {
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [openPositions, setOpenPositions] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/profile');
      if (res.data.status === 'success') {
        const p = res.data.data.profile || {};
        setCompany(p.company || '');
        setDesignation(p.designation || '');
        setIndustry(p.industry || '');
        setLocation(p.location || '');
        setAbout(p.about || '');
        setWebsite(p.website || '');
        setLinkedIn(p.linkedIn || '');
        setOpenPositions(p.openPositions?.join(', ') || '');
        setExperienceRequired(p.experienceRequired || '');
      }
    } catch (err) {
      console.error('Failed to load profile specs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const positionsArray = openPositions.split(',').map(pos => pos.trim()).filter(pos => pos !== '');

    try {
      const res = await api.put('/recruiter/profile', {
        company,
        designation,
        industry,
        location,
        about,
        website,
        linkedIn,
        openPositions: positionsArray,
        experienceRequired
      });

      if (res.data.status === 'success') {
        alert('Profile saved successfully!');
        fetchProfile();
      }
    } catch (err) {
      alert('Failed to update recruiter profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center font-mono text-xs animate-pulse text-slate-400">
          Syncing recruiter company profile...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 text-left max-w-4xl mx-auto pb-12 text-xs">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-205 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-505 bg-indigo-50 border px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Hiring preferences
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1.5 flex items-center">
              <Building className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Recruiter Profile</span>
            </h2>
            <p className="text-xs text-slate-550">
              Configure company listings, industry targets, and current open roles to display when developers browse recruiter tags.
            </p>
          </div>
        </div>

        {/* Profile Settings form */}
        <form onSubmit={handleSave} className="rounded-3xl border bg-white p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[8px]">Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Tech"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-slate-50 border rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[8px]">Designation / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Talent Sourcing Lead"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="bg-slate-50 border rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[8px]">Industry Sector</label>
              <input
                type="text"
                placeholder="e.g. Cloud SaaS, AI Fintech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="bg-slate-50 border rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[8px]">Office Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Seattle, WA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="font-bold text-slate-450 uppercase text-[8px]">About Me / Company Bio</label>
            <textarea
              rows={4}
              placeholder="Tell developers about your team culture, tech stacks, or hiring scope..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-2.5 w-full focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[8px]">Website URL</label>
              <div className="relative">
                <Globe className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://acmetech.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[8px]">LinkedIn Profile</label>
              <div className="relative">
                <Linkedin className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/recruiter"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[8px]">Open Hiring Positions</label>
              <input
                type="text"
                placeholder="React Developer, Devops Intern, ML Engineer"
                value={openPositions}
                onChange={(e) => setOpenPositions(e.target.value)}
                className="bg-slate-50 border rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 block mt-0.5">Separate values with commas.</span>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-bold text-slate-455 uppercase text-[8px]">Hiring Experience Requirements</label>
              <input
                type="text"
                placeholder="e.g. 0-2 years, open to students"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className="bg-slate-50 border rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow hover:opacity-90 transition-opacity"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default RecruiterProfile;
