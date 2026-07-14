import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from './LandingPage';

const Login = () => {
  const { openAuthModal, isAuthenticated, isAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const openedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      openAuthModal('login');
      openedRef.current = true;
    }
  }, [isAuthenticated, navigate, openAuthModal]);

  useEffect(() => {
    if (openedRef.current && !isAuthModalOpen && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthModalOpen, isAuthenticated, navigate]);

  return <LandingPage />;
};

export default Login;
