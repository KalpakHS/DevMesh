const mongoose = require('mongoose');

const workspaceFileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WorkspaceFile = mongoose.model('WorkspaceFile', workspaceFileSchema);
module.exports = WorkspaceFile;
