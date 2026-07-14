const mongoose = require('mongoose');

const mentorApplicationSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: [true, 'Please provide a cover message.'],
    },
    expertise: {
      type: String,
      required: [true, 'Please state your expertise.'],
    },
    experience: {
      type: String,
      required: [true, 'Please state your years of experience.'],
    },
    availability: {
      type: String,
      required: [true, 'Please state your availability.'],
    },
    expectedContribution: {
      type: String,
      required: [true, 'Please state your expected contribution.'],
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same project from the same mentor
mentorApplicationSchema.index({ projectId: 1, mentorId: 1 }, { unique: true });

const MentorApplication = mongoose.model('MentorApplication', mentorApplicationSchema);
module.exports = MentorApplication;
