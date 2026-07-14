const mongoose = require('mongoose');

const recruitmentInvitationSchema = new mongoose.Schema(
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
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    company: {
      type: String,
      required: [true, 'Please specify the inviting company.'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Please specify the position offered.'],
      trim: true,
    },
    salary: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Maybe Later'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const RecruitmentInvitation = mongoose.model('RecruitmentInvitation', recruitmentInvitationSchema);
module.exports = RecruitmentInvitation;
