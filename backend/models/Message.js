const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'A message must belong to a team workspace'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A message must have a sender'],
    },
    content: {
      type: String,
      required: [true, 'A message cannot be empty'],
      trim: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
