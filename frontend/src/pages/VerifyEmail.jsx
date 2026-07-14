import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.post(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Link may have expired.');
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-950/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center relative z-10">
        <Link to="/" className="inline-block font-sans font-extrabold text-2xl tracking-tight mb-8 text-white">
          DevMesh<span className="text-brand-accent">.</span>
        </Link>

        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
            <h2 className="text-xl font-bold">Verifying your email</h2>
            <p className="text-xs text-slate-400">Please wait while we validate your credentials...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-brand-success drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
            <h2 className="text-xl font-bold">Account Verified!</h2>
            <p className="text-sm text-slate-300">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold py-2.5 rounded-full hover:opacity-90 transition-opacity shadow shadow-lg glow-violet"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="w-16 h-16 text-brand-error drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <p className="text-sm text-brand-error">{message}</p>
            <Link
              to="/register"
              className="mt-6 inline-block w-full bg-slate-900 border border-slate-800 text-white font-bold py-2.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              Back to Registration
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
