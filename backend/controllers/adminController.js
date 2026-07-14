const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Application = require('../models/Application');
const Message = require('../models/Message');

const getUsersList = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserByAdmin = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);

    // Delete user's projects, applications, and team allocations
    await Project.deleteMany({ owner: userId });
    await Application.deleteMany({ applicant: userId });
    await Team.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );

    res.status(200).json({
      status: 'success',
      message: 'User and all associated data deleted successfully by Admin.',
    });
  } catch (error) {
    next(error);
  }
};

const getProjectsList = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProjectByAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    await Project.findByIdAndDelete(projectId);
    await Team.findOneAndDelete({ project: projectId });
    await Application.deleteMany({ project: projectId });

    res.status(200).json({
      status: 'success',
      message: 'Project and associated team workspace deleted successfully by Admin.',
    });
  } catch (error) {
    next(error);
  }
};

const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeTeams = await Team.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Aggregations
    const completedProjects = await Project.countDocuments({ status: 'Completed' });
    const pendingApplications = await Application.countDocuments({ status: 'Pending' });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalProjects,
          activeTeams,
          totalMessages,
          completedProjects,
          pendingApplications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsersList,
  deleteUserByAdmin,
  getProjectsList,
  deleteProjectByAdmin,
  getSystemStats,
};
