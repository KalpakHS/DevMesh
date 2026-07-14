import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(res.data.message || 'Password reset link sent! Check your inbox.');
      setEmail('');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to dispatch password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-950/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your email and we'll dispatch a link to reset your password.</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-brand-error/15 border border-brand-error/25 text-brand-error rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3 bg-brand-success/15 border border-brand-success/25 text-brand-success rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <span>Send Reset Link</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
