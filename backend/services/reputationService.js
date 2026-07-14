const User = require('../models/User');
const { checkAndAwardBadges } = require('./badgeService');

const addReputation = async (userId, points) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.reputation += points;
    if (user.reputation < 0) user.reputation = 0; // prevent negative reputation

    await user.save();
    console.log(`Updated user ${user.name} reputation by ${points} points. New Total: ${user.reputation}`);

    // Trigger badge evaluation
    await checkAndAwardBadges(userId);
  } catch (err) {
    console.error(`Error updating reputation for user ${userId}:`, err.message);
  }
};

module.exports = {
  addReputation,
};
