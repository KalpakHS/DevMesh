const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'A meeting must specify a project'],
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A meeting must specify the host mentor'],
    },
    title: {
      type: String,
      required: [true, 'A meeting must have a title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dateTime: {
      type: Date,
      required: [true, 'A meeting must specify Date and Time'],
    },
    meetLink: {
      type: String,
      default: '',
    },
    attendance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;
