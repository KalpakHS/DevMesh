const MentorRequest = require('../models/MentorRequest');
const Project = require('../models/Project');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { emitEvent } = require('../services/eventService');

// 1. Browse/Search/Filter Mentors
const getMentorsList = async (req, res, next) => {
  try {
    const { search, expertise } = req.query;

    const query = { role: 'Mentor' };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (expertise) {
      // Split expertise string and check intersection with user skills
      const expArray = expertise.split(',').map((e) => e.trim());
      query.skills = { $in: expArray };
    }

    const mentors = await User.find(query).select('name email avatar bio skills reputation availabilityStatus');

    res.status(200).json({
      status: 'success',
      data: { mentors },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Send Mentor Request
const sendMentorRequest = async (req, res, next) => {
  try {
    const { projectId, mentorId, message } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not own this project.', 403));
    }

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'Mentor') {
      return next(new AppError('User is not a mentor.', 400));
    }

    // Check if pending request exists
    const existing = await MentorRequest.findOne({ projectId, mentorId, status: 'Pending' });
    if (existing) {
      return next(new AppError('You already have a pending request sent to this mentor.', 400));
    }

    const request = await MentorRequest.create({
      projectId,
      mentorId,
      senderId: req.user._id,
      message: message || '',
    });

    // Notify mentor via socket
    const io = req.app.get('io');
    await emitEvent(io, 'MENTOR_REQUEST_RECEIVED', {
      projectId,
      actorId: req.user._id,
      recipientId: mentorId,
      targetId: request._id,
      targetType: 'MentorRequest',
      title: 'Mentor Request Received 📨',
      message: `${req.user.name} sent you a request to mentor "${project.title}"`,
      link: `/projects/${projectId}`,
      actionText: `sent a mentorship request for "${project.title}"`
    });

    res.status(201).json({
      status: 'success',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Resolve Mentor Request (Accept/Reject)
const resolveMentorRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      return next(new AppError('Invalid request resolution status.', 400));
    }

    const request = await MentorRequest.findById(requestId).populate('projectId');
    if (!request) return next(new AppError('Request not found.', 404));

    if (request.mentorId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Unauthorized.', 403));
    }

    request.status = status;
    await request.save();

    const project = request.projectId;
    const io = req.app.get('io');

    if (status === 'Accepted') {
      // Assign mentor to project
      project.mentorId = req.user._id;
      await project.save();

      // Notify owner of acceptance
      await emitEvent(io, 'MENTOR_REQUEST_ACCEPTED', {
        projectId: project._id,
        actorId: req.user._id,
        recipientId: request.senderId,
        targetId: request._id,
        targetType: 'MentorRequest',
        points: 5, // Award mentor +5 reputation points for accepting
        title: 'Mentor Request Accepted! 🎉',
        message: `${req.user.name} accepted your request to mentor "${project.title}"`,
        link: `/projects/${project._id}`,
        actionText: `accepted request to mentor "${project.title}"`
      });
    } else {
      // Notify owner of rejection
      await emitEvent(io, 'MENTOR_REQUEST_REJECTED', {
        projectId: project._id,
        actorId: req.user._id,
        recipientId: request.senderId,
        targetId: request._id,
        targetType: 'MentorRequest',
        title: 'Mentor Request Declined ❌',
        message: `${req.user.name} declined your request to mentor "${project.title}"`,
        link: `/projects/${project._id}`,
        actionText: `declined request to mentor "${project.title}"`
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Request successfully ${status.toLowerCase()}ed.`,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Project Requests Status list
const getProjectRequests = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requests = await MentorRequest.find({ projectId })
      .populate('mentorId', 'name email avatar bio skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get Incoming requests for a mentor
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await MentorRequest.find({ mentorId: req.user._id })
      .populate({
        path: 'projectId',
        populate: {
          path: 'owner members.userId',
          select: 'name email avatar college reputation skills socialLinks bio availabilityStatus'
        }
      })
      .populate('senderId', 'name email avatar bio')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMentorsList,
  sendMentorRequest,
  resolveMentorRequest,
  getProjectRequests,
  getIncomingRequests,
};
