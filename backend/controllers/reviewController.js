const Review = require('../models/Review');
const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { addReputation } = require('../services/reputationService');

const createReview = async (req, res, next) => {
  try {
    const { projectId, revieweeId, rating, comment } = req.body;

    if (!projectId || !revieweeId || !rating || !comment) {
      return next(new AppError('Please provide project, reviewee, rating, and comment.', 400));
    }

    if (revieweeId.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot review yourself.', 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Verify project is completed
    if (project.status !== 'Completed') {
      return next(new AppError('You can only review teammates on completed projects.', 400));
    }

    // Verify both reviewer and reviewee are in the team
    const team = await Team.findOne({ project: projectId });
    if (!team) {
      return next(new AppError('No team workspace found for this project.', 404));
    }

    const reviewerInTeam = team.members.some((m) => m.user.toString() === req.user._id.toString());
    const revieweeInTeam = team.members.some((m) => m.user.toString() === revieweeId.toString());

    if (!reviewerInTeam || !revieweeInTeam) {
      return next(new AppError('Both you and the reviewee must be members of the project team.', 403));
    }

    const review = await Review.create({
      project: projectId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
    });

    // Update reputation score: positive ratings give reputation points
    const repGained = rating >= 4 ? 5 : rating >= 3 ? 2 : 0;
    await addReputation(revieweeId, repGained);

    res.status(201).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
};
