const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { protect } = require('../middleware/authMiddleware');

const AppError = require('../utils/appError');

const checkIsRecruiter = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role !== 'recruiter' && role !== 'admin') {
    return next(new AppError('Access denied. Recruiter role required.', 403));
  }
  next();
};

router.use(protect);

// Allow both recruiters and developers to use direct message endpoints
router.post('/messages', recruiterController.sendRecruiterMessage);
router.get('/messages/:partnerId', recruiterController.getRecruiterMessages);
router.get('/conversations', recruiterController.getRecruiterConversations);

router.use(checkIsRecruiter);

router.get('/dashboard', recruiterController.getRecruiterDashboard);
router.get('/developers', recruiterController.searchDevelopers);
router.get('/developers/:developerId', recruiterController.getDeveloperProfile);
router.post('/bookmarks/:developerId', recruiterController.toggleBookmarkCandidate);
router.get('/bookmarks', recruiterController.getBookmarkedCandidates);
router.get('/shortlists', recruiterController.getShortlistedCandidates);
router.post('/shortlists/:developerId', recruiterController.toggleShortlistCandidate);
router.get('/interviews', recruiterController.getRecruiterInterviews);
router.post('/interviews', recruiterController.scheduleInterview);
router.put('/interviews/:interviewId', recruiterController.updateInterviewDetails);
router.get('/profile', recruiterController.getRecruiterProfile);
router.put('/profile', recruiterController.updateRecruiterProfile);

// Private Candidate Evaluation Notes
router.get('/developers/:developerId/notes', recruiterController.getDeveloperNotes);
router.post('/developers/:developerId/notes', recruiterController.addDeveloperNote);
router.delete('/notes/:noteId', recruiterController.deleteDeveloperNote);

router.post('/developers/:developerId/resume-download', recruiterController.trackResumeDownload);

// Job Posting & Applications
router.post('/jobs', recruiterController.createJob);
router.get('/jobs', recruiterController.getPostedJobs);
router.get('/jobs/:jobId', recruiterController.getSingleJob);
router.put('/jobs/:jobId', recruiterController.updateJobDetails);
router.delete('/jobs/:jobId', recruiterController.deleteJob);
router.get('/applications', recruiterController.getIncomingJobApplications);
router.put('/applications/:applicationId/status', recruiterController.updateApplicationStatus);

// Invitations & Offers
router.post('/invitations', recruiterController.sendDirectInvitation);
router.get('/invitations', recruiterController.getSentInvitations);
router.post('/offers', recruiterController.sendOfferLetter);
router.get('/offers', recruiterController.getSentOffers);

module.exports = router;
