const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', mentorController.getMentorDashboard);
router.get('/requests', mentorController.getMentorRequestsList);
router.get('/projects', mentorController.getAssignedProjects);
router.post('/reviews', mentorController.submitMilestoneReview);
router.get('/meetings', mentorController.getMentorMeetings);
router.post('/meetings', mentorController.createMentorMeeting);
router.put('/meetings/:meetingId', mentorController.updateMentorMeeting);
router.get('/analytics', mentorController.getMentorAnalytics);

// Marketplace & Applications endpoints
router.get('/marketplace', mentorController.getMentorMarketplace);
router.post('/marketplace/:projectId/apply', mentorController.applyAsMentor);
router.post('/marketplace/:projectId/bookmark', mentorController.bookmarkProject);
router.get('/marketplace/bookmarks', mentorController.getBookmarkedProjects);
router.post('/projects/:projectId/resolve-completion', mentorController.resolveProjectCompletion);

// Project Owner actions
router.get('/projects/:projectId/applications', mentorController.getProjectMentorApplications);
router.put('/applications/:applicationId/resolve', mentorController.resolveMentorApplication);

// Mentor Applications management
router.get('/applications', mentorController.getMyMentorApplications);
router.put('/applications/:applicationId/withdraw', mentorController.withdrawMentorApplication);
router.post('/applications/:applicationId/reapply', mentorController.reapplyMentorApplication);

module.exports = router;
