const mongoose = require('mongoose');

const repEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const RepEvent = mongoose.model('RepEvent', repEventSchema);
module.exports = RepEvent;
