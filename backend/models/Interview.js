const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please specify an interview title.'],
    },
    description: {
      type: String,
      default: '',
    },
    dateTime: {
      type: Date,
      required: [true, 'Please specify interview date and time.'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online',
    },
    meetLink: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'Accepted', 'Declined'],
      default: 'Scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
