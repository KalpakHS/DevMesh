const mongoose = require('mongoose');

const mentorReviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    milestoneStatus: {
      type: String,
      enum: ['approved', 'rejected', 'resubmission_requested', 'Approved', 'Rejected', 'Resubmission Requested'],
      required: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    resubmissionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const MentorReview = mongoose.model('MentorReview', mentorReviewSchema);
module.exports = MentorReview;
