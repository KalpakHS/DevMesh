import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, X, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    closeAuthModal, 
    setAuthModalTab, 
    login, 
    register, 
    isAuthenticated 
  } = useAuth();

  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User'); // 'User', 'Mentor', 'Recruiter'
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Monitor Escape key and background scroll locking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // If already authenticated and modal is open, close it and navigate to dashboard
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAuthModalOpen, navigate, closeAuthModal]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      closeAuthModal();
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    const res = await register(name, email, password, role);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message || 'Registration successful! Verification email sent.');
      // Clear forms
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Glassmorphic Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-slate-950/45 dark:bg-[#07111F]/50 backdrop-blur-[20px]"
        />

        {/* Modal Card Body Container */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.93, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 15 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-[430px] rounded-[24px] border border-white/20 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-7 shadow-[0_0_50px_rgba(59,130,246,0.18)] z-10 text-slate-900 dark:text-white"
        >
          {/* Close button (top right corner) */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Logo Heading */}
          <div className="text-center mb-6">
            <span className="font-sans font-extrabold text-2xl tracking-tight text-slate-950 dark:text-white">
              DevMesh<span className="text-blue-500">.</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {authModalTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </p>
          </div>

          {/* Navigation tabs inside the modal */}
          <div className="flex bg-slate-100 dark:bg-slate-950/80 rounded-xl p-1 mb-6 border border-slate-200/50 dark:border-slate-800/60">
            <button
              onClick={() => { setAuthModalTab('login'); clearMessages(); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                authModalTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setAuthModalTab('register'); clearMessages(); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                authModalTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alerts Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-xl text-xs font-medium">
              {successMsg}
            </div>
          )}

          {/* Animated Tab Switcher Container */}
          <div className="overflow-hidden relative">
            <AnimatePresence mode="wait">
              {authModalTab === 'login' ? (
                <motion.form
                  key="login-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  {/* Email input field */}
                  <div className="flex flex-col space-y-1 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-800 dark:text-slate-100 w-full focus:outline-none placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password input field */}
                  <div className="flex flex-col space-y-1 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          closeAuthModal();
                          navigate('/forgot-password');
                        }}
                        className="text-[10px] font-bold text-blue-500 hover:underline focus:outline-none"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-800 dark:text-slate-100 w-full focus:outline-none placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-3 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Logging in...' : 'Sign In'}</span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  {/* Name field */}
                  <div className="flex flex-col space-y-1 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-800 dark:text-slate-100 w-full focus:outline-none placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col space-y-1 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="john@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-800 dark:text-slate-100 w-full focus:outline-none placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col space-y-1 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-800 dark:text-slate-100 w-full focus:outline-none placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role Segmented Selector */}
                  <div className="flex flex-col space-y-1 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Workspace Role</label>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                      {[
                        { label: 'Developer', value: 'User' },
                        { label: 'Mentor', value: 'Mentor' },
                        { label: 'Recruiter', value: 'Recruiter' }
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setRole(item.value)}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            role === item.value
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Registering...' : 'Register'}</span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
