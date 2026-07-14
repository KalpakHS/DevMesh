const mongoose = require('mongoose');

const mentorRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'A mentor request must specify a project'],
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A mentor request must target a registered mentor'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A mentor request must have a sender (project owner)'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    message: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MentorRequest = mongoose.model('MentorRequest', mentorRequestSchema);
module.exports = MentorRequest;
