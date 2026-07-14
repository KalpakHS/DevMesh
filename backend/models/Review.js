const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'A review must be linked to a project'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must have a reviewer'],
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must target a reviewee'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please leave a brief review comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent reviewing same person multiple times for the same project
reviewSchema.index({ project: 1, reviewer: 1, reviewee: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
