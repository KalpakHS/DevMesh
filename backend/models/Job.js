const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please specify a job title.'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please specify a company name.'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobType: {
      type: String,
      enum: ['Internship', 'Full Time', 'Part Time', 'Contract'],
      default: 'Full Time',
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'On-site',
    },
    location: {
      type: String,
      required: [true, 'Please specify a location.'],
      trim: true,
    },
    salary: {
      type: String,
      default: '',
    },
    experienceRequired: {
      type: String,
      default: '',
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Please specify a job description.'],
    },
    responsibilities: {
      type: String,
      default: '',
    },
    eligibility: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
    },
    openings: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
