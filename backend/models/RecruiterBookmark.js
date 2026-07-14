const mongoose = require('mongoose');

const recruiterBookmarkSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate candidate bookmarks by the same recruiter
recruiterBookmarkSchema.index({ recruiterId: 1, developerId: 1 }, { unique: true });

const RecruiterBookmark = mongoose.model('RecruiterBookmark', recruiterBookmarkSchema);
module.exports = RecruiterBookmark;
