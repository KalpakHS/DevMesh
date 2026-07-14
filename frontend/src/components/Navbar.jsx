import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated, openAuthModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Workspace', path: '/dashboard' },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      openAuthModal('register');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3 bg-white/70 dark:bg-brand-dark/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-lg'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <svg width="32" height="32" viewBox="0 0 100 100" className="text-brand-primary dark:text-brand-accent group-hover:rotate-6 transition-transform duration-300">
              <path d="M25,25 L55,25 L55,75 M55,25 L75,50 L55,75 M25,25 L25,75 L55,75" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              <circle cx="25" cy="25" r="8" fill="currentColor" />
              <circle cx="55" cy="25" r="8" fill="currentColor" />
              <circle cx="25" cy="75" r="8" fill="currentColor" />
              <circle cx="55" cy="75" r="8" fill="currentColor" />
              <circle cx="75" cy="50" r="10" fill="currentColor" />
            </svg>
            <span className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              DevMesh<span className="text-brand-accent">.</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="relative text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-accent transition-colors py-1"
                >
                  {item.label}
                  {/* Sliding active indicator using layoutId */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent glow-violet"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              to="/docs"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-accent transition-colors py-1"
            >
              Docs
            </Link>
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-accent transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 border border-slate-700 dark:border-slate-800 rounded-full transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-accent transition-colors"
                >
                  <LogIn className="w-4.5 h-4.5 mr-1.5" />
                  Log In
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-primary to-brand-accent rounded-full shadow-md hover:shadow-lg glow-violet"
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Hamburguer */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-[#0B0F19] border-l border-slate-800 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-bold text-white">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col space-y-4">
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-slate-300 hover:text-white block py-2 border-b border-slate-900"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 3 * 0.04 }}
                  >
                    <Link
                      to="/docs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-slate-300 hover:text-white block py-2 border-b border-slate-900"
                    >
                      Docs
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="flex flex-col space-y-3 mt-auto">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center font-medium text-white border border-slate-800 rounded-full hover:bg-slate-900 transition-colors"
                    >
                      Workspace
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-2.5 text-center font-medium text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition-colors"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full py-2.5 text-center font-medium text-slate-300 hover:text-white border border-slate-800 rounded-full hover:bg-slate-900 transition-colors"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleGetStarted();
                      }}
                      className="w-full py-2.5 text-center font-medium text-white bg-gradient-to-r from-brand-primary to-brand-accent rounded-full shadow-md"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
