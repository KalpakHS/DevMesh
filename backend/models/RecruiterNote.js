const mongoose = require('mongoose');

const recruiterNoteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: [true, 'Note content cannot be empty.'],
    },
  },
  {
    timestamps: true,
  }
);

// Allow multiple private notes per recruiter-candidate combination
recruiterNoteSchema.index({ recruiterId: 1, developerId: 1 });

const RecruiterNote = mongoose.model('RecruiterNote', recruiterNoteSchema);
module.exports = RecruiterNote;
