const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, authController.resetPassword);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
