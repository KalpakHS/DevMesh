import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import AuthModal from './components/AuthModal';

// Import Screens
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';
import ProjectMarketplace from './pages/ProjectMarketplace';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import TeamWorkspace from './pages/TeamWorkspace';
import NotificationsPage from './pages/NotificationsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import DeveloperRecruitment from './pages/DeveloperRecruitment';
import DeveloperJobs from './pages/DeveloperJobs';
import RecruiterJobs from './pages/RecruiterJobs';
import AdminDashboard from './pages/AdminDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterSearch from './pages/RecruiterSearch';
import RecruiterDeveloperProfile from './pages/RecruiterDeveloperProfile';
import RecruiterSaved from './pages/RecruiterSaved';
import RecruiterShortlist from './pages/RecruiterShortlist';
import RecruiterMessages from './pages/RecruiterMessages';
import RecruiterInterviews from './pages/RecruiterInterviews';
import RecruiterProfile from './pages/RecruiterProfile';
import MentorDashboard from './pages/MentorDashboard';
import MentorRequests from './pages/MentorRequests';
import MentorProjects from './pages/MentorProjects';
import MentorReviews from './pages/MentorReviews';
import MentorMeetings from './pages/MentorMeetings';
import MentorMarketplace from './pages/MentorMarketplace';
import MentorApplications from './pages/MentorApplications';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <Router>
          <CustomCursor />
          <AuthModal />
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Protected Developer Workspace */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <ProjectMarketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/edit"
              element={
                <ProtectedRoute>
                  <EditProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/create"
              element={
                <ProtectedRoute>
                  <CreateProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:id"
              element={
                <ProtectedRoute>
                  <TeamWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/jobs"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <DeveloperJobs />
                </ProtectedRoute>
              }
            />
             <Route
              path="/recruitment"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <DeveloperRecruitment />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Workspace */}
             <Route
              path="/recruiter"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/search"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/developers/:developerId"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterDeveloperProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/saved"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterSaved />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/shortlist"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterShortlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/messages"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/interviews"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterInterviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/profile"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <RecruiterProfile />
                </ProtectedRoute>
              }
            />

            {/* Mentor Workspace */}
            <Route
              path="/mentor"
              element={
                <ProtectedRoute allowedRoles={['Mentor']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/requests"
              element={
                <ProtectedRoute allowedRoles={['Mentor']}>
                  <MentorRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/projects"
              element={
                <ProtectedRoute allowedRoles={['Mentor']}>
                  <MentorProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/marketplace"
              element={
                <ProtectedRoute allowedRoles={['Mentor']}>
                  <MentorMarketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/applications"
              element={
                <ProtectedRoute allowedRoles={['Mentor']}>
                  <MentorApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/reviews"
              element={
                <ProtectedRoute allowedRoles={['Mentor']}>
                  <MentorReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/meetings"
              element={
                <ProtectedRoute allowedRoles={['Mentor']}>
                  <MentorMeetings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      )}
    </>
  );
};

export default App;
