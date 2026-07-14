const mongoose = require('mongoose');

const resumeDownloadSchema = new mongoose.Schema(
  {
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

resumeDownloadSchema.index({ developerId: 1, createdAt: -1 });

const ResumeDownload = mongoose.model('ResumeDownload', resumeDownloadSchema);
module.exports = ResumeDownload;
