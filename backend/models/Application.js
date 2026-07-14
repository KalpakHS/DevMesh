const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'An application must belong to a project'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An application must belong to an applicant'],
    },
    role: {
      type: String,
      required: [true, 'Please specify the role you are applying for'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn', 'pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'Pending',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    direction: {
      type: String,
      enum: ['applied', 'invited'],
      default: 'applied',
    },
    message: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same user for same role/project
applicationSchema.index({ project: 1, applicant: 1, role: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
