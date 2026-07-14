const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge must have a name'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Badge must have a description'],
    },
    icon: {
      type: String,
      required: [true, 'Badge must specify an icon label'],
    },
    milestone: {
      type: String,
      required: [true, 'Badge must have a milestone key'],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
