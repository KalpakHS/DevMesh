const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { validateProject } = require('../validators/projectValidator');

router.get('/', projectController.getProjects);
router.get('/recommendations', protect, projectController.getRecommendations);
router.get('/:id', projectController.getProject);

// Protected actions
router.post('/', protect, validateProject, projectController.createProject);
router.put('/:id', protect, validateProject, projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);

// Applications flow
router.post('/:id/apply', protect, projectController.applyToProject);
router.post('/:id/invite', protect, projectController.inviteDeveloper);
router.post('/:id/submit-completion', protect, projectController.submitProjectCompletion);
router.get('/:id/applications', protect, projectController.getProjectApplications);
router.post('/applications/:appId/status', protect, projectController.updateApplicationStatus);
router.delete('/applications/:appId', protect, projectController.withdrawApplication);

module.exports = router;
