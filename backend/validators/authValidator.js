const AppError = require('../utils/appError');

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  if (role && !['User', 'Mentor', 'Recruiter', 'Admin'].includes(role)) {
    return next(new AppError('Invalid user role specified', 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
