const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/leaderboard', userController.getLeaderboard);
router.get('/profile/:id', userController.getProfile);
router.get('/portfolio/:id', userController.getPortfolio);

// Protected actions
router.get('/search', protect, userController.searchDevelopers);
router.get('/my-applications', protect, userController.getMyApplications);
router.post('/invite', protect, userController.sendInterviewInvitation);
router.post('/bookmark', protect, userController.toggleBookmark);
router.get('/bookmarks', protect, userController.getBookmarks);
router.put('/profile', protect, upload.single('avatar'), userController.updateProfile);
router.post('/upload-resume', protect, upload.single('resume'), userController.uploadResume);
router.delete('/me', protect, userController.deleteAccount);

// Developer Recruitment & Sourcing Integrations
router.get('/recruitment-activity', protect, userController.getRecruitmentActivity);
router.put('/recruitment-settings', protect, userController.updateRecruitmentSettings);
router.put('/interviews/:interviewId/respond', protect, userController.respondToInterview);
router.get('/recruiter-profile/:recruiterId', protect, userController.getRecruiterProfileForDev);

// Marketplace & Saved Jobs
router.get('/jobs', protect, userController.getJobsMarketplace);
router.get('/jobs/:jobId', protect, userController.getSingleJobForDev);
router.post('/jobs/:jobId/save', protect, userController.toggleSaveJob);
router.get('/saved-jobs', protect, userController.getSavedJobs);
router.post('/jobs/:jobId/apply', protect, userController.applyToJob);

// Applications, Direct Invites & Offers
router.get('/jobs-applications', protect, userController.getDeveloperApplications);
router.get('/invitations', protect, userController.getDeveloperInvitations);
router.put('/invitations/:invitationId/respond', protect, userController.respondToInvitation);
router.get('/offers', protect, userController.getDeveloperOffers);
router.put('/offers/:offerId/respond', protect, userController.respondToOffer);

// Follow Companies
router.post('/companies/:profileId/follow', protect, userController.followCompany);
router.get('/followed-companies', protect, userController.getFollowedCompanies);

module.exports = router;
