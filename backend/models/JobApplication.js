const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    hackerrank: {
      type: String,
      default: '',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    portfolio: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple applications to the same job by same developer
jobApplicationSchema.index({ jobId: 1, developerId: 1 }, { unique: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
module.exports = JobApplication;
