const mongoose = require('mongoose');

const recruiterMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty.'],
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const RecruiterMessage = mongoose.model('RecruiterMessage', recruiterMessageSchema);
module.exports = RecruiterMessage;
