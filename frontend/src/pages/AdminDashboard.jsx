import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { ShieldAlert, Users, FolderKanban, MessageSquare, Trash2, Award } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('users'); // users, projects

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.data.stats);
      }

      const usersRes = await api.get('/admin/users');
      if (usersRes.data.status === 'success') {
        setUsersList(usersRes.data.data.users);
      }

      const projectsRes = await api.get('/admin/projects');
      if (projectsRes.data.status === 'success') {
        setProjectsList(projectsRes.data.data.projects);
      }
    } catch (err) {
      console.warn('Failed to load admin stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user and all associated projects/applications? This is permanent.')) {
      try {
        const res = await api.delete(`/admin/users/${userId}`);
        if (res.data.status === 'success') {
          setUsersList(usersList.filter((u) => u._id !== userId));
          fetchAdminData(); // update stats
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteProject = async (projId) => {
    if (window.confirm('Delete this project listing and associated team workspace? This is permanent.')) {
      try {
        const res = await api.delete(`/admin/projects/${projId}`);
        if (res.data.status === 'success') {
          setProjectsList(projectsList.filter((p) => p._id !== projId));
          fetchAdminData(); // update stats
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete project.');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2 text-brand-error">
            <ShieldAlert className="w-6 h-6" />
            <span>Admin Control Panel</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor system growth analytics and moderate platform content.
          </p>
        </div>

        {/* Analytics stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-5 shadow-sm">
              <span className="block text-xs font-semibold text-slate-500">Registered Users</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {stats.totalUsers}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-5 shadow-sm">
              <span className="block text-xs font-semibold text-slate-500">Total Projects</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {stats.totalProjects}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-5 shadow-sm">
              <span className="block text-xs font-semibold text-slate-500">Active Teams</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {stats.activeTeams}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-5 shadow-sm">
              <span className="block text-xs font-semibold text-slate-500">Completed Projects</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {stats.completedProjects}
              </span>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setAdminTab('users')}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              adminTab === 'users'
                ? 'border-brand-error text-brand-error'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => setAdminTab('projects')}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              adminTab === 'projects'
                ? 'border-brand-error text-brand-error'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Manage Projects</span>
          </button>
        </div>

        {/* Tab content 1: Manage Users */}
        {adminTab === 'users' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-6 shadow-sm overflow-hidden">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full text-xs text-slate-500">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-900/60 text-slate-400 font-mono">
                    <th className="py-3 text-left">Developer Name</th>
                    <th className="py-3 text-left">Email Address</th>
                    <th className="py-3 text-left">Role</th>
                    <th className="py-3 text-left">Reputation</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900/60">
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                        {usr.name}
                      </td>
                      <td className="py-3 font-mono">{usr.email}</td>
                      <td className="py-3 capitalize">{usr.role}</td>
                      <td className="py-3 font-mono">{usr.reputation} REP</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-1.5 border border-slate-200 dark:border-slate-900 rounded hover:border-brand-error text-slate-400 hover:text-brand-error transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab content 2: Manage Projects */}
        {adminTab === 'projects' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-6 shadow-sm overflow-hidden">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full text-xs text-slate-500">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-900/60 text-slate-400 font-mono">
                    <th className="py-3 text-left">Project Listing Title</th>
                    <th className="py-3 text-left">Owner</th>
                    <th className="py-3 text-left">Category</th>
                    <th className="py-3 text-left">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900/60">
                  {projectsList.map((proj) => (
                    <tr key={proj._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {proj.title}
                      </td>
                      <td className="py-3 font-semibold">{proj.owner?.name}</td>
                      <td className="py-3 font-mono">{proj.category}</td>
                      <td className="py-3">{proj.status}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteProject(proj._id)}
                          className="p-1.5 border border-slate-200 dark:border-slate-900 rounded hover:border-brand-error text-slate-400 hover:text-brand-error transition-colors"
                          title="Delete Project Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
