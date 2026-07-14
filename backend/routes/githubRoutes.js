const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const { protect } = require('../middleware/authMiddleware');

router.get('/link-account', protect, githubController.linkGithubAccount);
router.post('/webhook', githubController.handlePushWebhook);

module.exports = router;
