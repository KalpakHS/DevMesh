const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema(
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

// Optimize metrics queries
profileViewSchema.index({ developerId: 1, createdAt: -1 });

const ProfileView = mongoose.model('ProfileView', profileViewSchema);
module.exports = ProfileView;
