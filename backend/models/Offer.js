const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
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
      required: [true, 'Please specify the company offering.'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please specify the role offered.'],
      trim: true,
    },
    salary: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      required: [true, 'Please specify the joining date.'],
    },
    location: {
      type: String,
      default: '',
    },
    offerLetterUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Sent', 'Accepted', 'Rejected', 'Questions Asked'],
      default: 'Sent',
    },
    questions: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
