const express = require('express');
const router = express.Router();
const mentorRequestController = require('../controllers/mentorRequestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/mentors', mentorRequestController.getMentorsList);
router.post('/', mentorRequestController.sendMentorRequest);
router.put('/:requestId/status', mentorRequestController.resolveMentorRequest);
router.get('/project/:projectId', mentorRequestController.getProjectRequests);
router.get('/incoming', mentorRequestController.getIncomingRequests);

module.exports = router;
