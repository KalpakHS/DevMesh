const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    linkedIn: {
      type: String,
      default: '',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    openPositions: {
      type: [String],
      default: [],
    },
    experienceRequired: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    employees: {
      type: String,
      default: '',
    },
    locations: {
      type: [String],
      default: [],
    },
    culture: {
      type: String,
      default: '',
    },
    benefits: {
      type: String,
      default: '',
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate profile documents per recruiter user
recruiterProfileSchema.index({ recruiterId: 1 }, { unique: true });

const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);
module.exports = RecruiterProfile;
