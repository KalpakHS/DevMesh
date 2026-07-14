const AppError = require('../utils/appError');

const validateProject = (req, res, next) => {
  const { title, description, category, rolesNeeded } = req.body;

  if (!title || !description) {
    return next(new AppError('Please provide a project title and description', 400));
  }

  if (title.trim().length < 5) {
    return next(new AppError('Project title must be at least 5 characters long', 400));
  }

  if (description.trim().length < 20) {
    return next(new AppError('Project description must be at least 20 characters long', 400));
  }

  if (rolesNeeded && !Array.isArray(rolesNeeded)) {
    return next(new AppError('Roles needed must be an array', 400));
  }

  if (rolesNeeded) {
    for (const role of rolesNeeded) {
      if (!role.roleName) {
        return next(new AppError('Each requested role must have a roleName', 400));
      }
    }
  }

  next();
};

module.exports = {
  validateProject,
};
