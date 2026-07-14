import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Lock, ArrowRight, Check } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMsg('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setSuccessMsg(res.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-950/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Choose a new password</h2>
          <p className="text-xs text-slate-400 mt-1">Please enter a new secure password for your account.</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-brand-error/15 border border-brand-error/25 text-brand-error rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3 bg-brand-success/15 border border-brand-success/25 text-brand-success rounded-xl text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-brand-success" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-400">New Password</label>
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none text-sm text-slate-200 w-full focus:outline-none"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-400">Confirm New Password</label>
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-transparent border-none text-sm text-slate-200 w-full focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg glow-violet disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
