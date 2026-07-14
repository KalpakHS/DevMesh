const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/users', adminController.getUsersList);
router.delete('/users/:id', adminController.deleteUserByAdmin);

router.get('/projects', adminController.getProjectsList);
router.delete('/projects/:id', adminController.deleteProjectByAdmin);

router.get('/stats', adminController.getSystemStats);

module.exports = router;
