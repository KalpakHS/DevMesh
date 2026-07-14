const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const AppError = require('../utils/appError');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email address already exists.', 400));
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'User',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires,
      isEmailVerified: process.env.ENFORCE_EMAIL_VERIFICATION !== 'true', // if not enforced, set verified
    });

    // Send verification email
    await sendVerificationEmail(newUser, verificationToken);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Verification link is invalid or has expired.', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Your email has been verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    if (process.env.ENFORCE_EMAIL_VERIFICATION === 'true' && !user.isEmailVerified) {
      return next(new AppError('Please verify your email address before logging in.', 403));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user / cookie (optional, simple return here)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          reputation: user.reputation,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('Refresh token is required.', 400));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'devmesh_fallback_jwt_refresh_secret');

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token. Please log in again.', 401));
  }
};

const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes link expiration
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email!',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token) {
      return next(new AppError('Password reset token is missing.', 400));
    }

    if (!validatePasswordStrength(password)) {
      return next(new AppError('Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 400));
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Password reset link is invalid or has expired.', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Your password has been successfully reset! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please specify both your current password and a new password.', 400));
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    const isCorrect = await user.comparePassword(currentPassword, user.password);
    if (!isCorrect) {
      return next(new AppError('The current password you entered is incorrect.', 401));
    }

    if (!validatePasswordStrength(newPassword)) {
      return next(new AppError('New password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 400));
    }

    user.password = newPassword;
    await user.save();

    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      actorId: req.user._id,
      action: 'Changed account security password successfully',
      targetType: 'User',
      targetId: req.user._id
    });

    const io = req.app.get('io');
    const { emitEvent } = require('../services/eventService');
    await emitEvent(io, 'PASSWORD_CHANGED', {
      actorId: req.user._id,
      recipientId: req.user._id,
      targetId: req.user._id,
      targetType: 'User',
      title: 'Security Alert: Password Changed 🔒',
      message: 'Your account password was updated successfully. If this wasn\'t you, secure your account immediately.',
      link: '/settings',
      actionText: 'changed password'
    });

    res.status(200).json({
      status: 'success',
      message: 'Your password was changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  res.clearCookie('accessToken');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
};
