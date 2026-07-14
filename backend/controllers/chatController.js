const Message = require('../models/Message');
const Team = require('../models/Team');
const AppError = require('../utils/appError');

const getTeamMessages = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const team = await Team.findById(teamId);
    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'Admin') {
      return next(new AppError('You are not authorized to access this chat room.', 403));
    }

    const skipIdx = (page - 1) * limit;

    const messages = await Message.find({ team: teamId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skipIdx)
      .limit(parseInt(limit));

    // We return messages in chronological order (oldest first) for UI rendering
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages: messages.reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeamMessages,
};
