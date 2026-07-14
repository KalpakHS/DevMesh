const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema(
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
    stage: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Shortlisted',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate shortlists
shortlistSchema.index({ recruiterId: 1, developerId: 1 }, { unique: true });

const Shortlist = mongoose.model('Shortlist', shortlistSchema);
module.exports = Shortlist;
