import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';

const EditProject = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.data.status === 'success') {
          const p = res.data.data.project;
          setTitle(p.title);
          setDescription(p.description);
          setCategory(p.category);
        }
      } catch (err) {
        setError('Failed to load project details.');
      }
    };
    fetchProject();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/projects/${id}`, { title, description, category });
      if (res.data.status === 'success') {
        navigate(`/projects/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 text-left max-w-xl mx-auto"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Project</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update your project definition parameters.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/25 text-red-500 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <Edit3 className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-base">Modify Project Definition</h3>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="Web Development" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Web Development</option>
              <option value="Mobile Apps" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Mobile Apps</option>
              <option value="AI & Machine Learning" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">AI & Machine Learning</option>
              <option value="Blockchain & Web3" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Blockchain & Web3</option>
              <option value="Game Development" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Game Development</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-md transition-all w-full"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </Layout>
  );
};

export default EditProject;
