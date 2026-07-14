const Project = require('../models/Project');
const User = require('../models/User');
const MentorReview = require('../models/MentorReview');
const Meeting = require('../models/Meeting');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const MentorRequest = require('../models/MentorRequest');
const MentorApplication = require('../models/MentorApplication');
const Bookmark = require('../models/Bookmark');
const Team = require('../models/Team');
const AppError = require('../utils/appError');
const { emitEvent } = require('../services/eventService');

// Role Permission Check Helper
const checkIsMentor = (req, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role !== 'mentor' && role !== 'admin') {
    throw new AppError('Access denied. Mentor role required.', 403);
  }
};

// 1. Mentor Dashboard API
const getMentorDashboard = async (req, res, next) => {
  try {
    checkIsMentor(req, next);
    const mentorId = req.user._id;

    const projectsList = await Project.find({ mentorId }).select('_id title owner members').populate('owner', 'name avatar');
    const projectIds = projectsList.map(p => p._id);

    // Analytics Metrics
    const projectsAssigned = await Project.countDocuments({ mentorId });
    const activeProjects = await Project.countDocuments({ mentorId, status: { $ne: 'Completed' } });
    const pendingReviews = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'review' });

    // New phase stats for application tabs
    const pendingApplications = await MentorApplication.countDocuments({ mentorId, status: 'Pending' });
    const acceptedApplications = await Project.countDocuments({ mentorId });
    const rejectedApplications = await MentorApplication.countDocuments({ mentorId, status: 'Rejected' });

    // Meetings this week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const meetingsThisWeek = await Meeting.countDocuments({
      mentorId,
      dateTime: { $gte: startOfWeek, $lte: endOfWeek }
    });

    // REP Earned through mentoring (calculated based on number of reviews * 15)
    const reviewsCount = await MentorReview.countDocuments({ mentorId, milestoneStatus: 'approved' });
    const repEarned = reviewsCount * 15;

    // Lists
    const upcomingMeetings = await Meeting.find({ mentorId, status: 'Scheduled' })
      .populate('projectId', 'title')
      .sort({ dateTime: 1 })
      .limit(5);

    const requests = await MentorRequest.find({ mentorId, status: 'Pending' })
      .populate('projectId', 'title category description')
      .populate('senderId', 'name email avatar')
      .limit(5);

    const notifications = await Notification.find({ recipient: mentorId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent activity logs inside mentored projects
    const recentActivity = await ActivityLog.find({ projectId: { $in: projectIds } })
      .populate('actorId', 'name avatar')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          projectsAssigned,
          activeProjects,
          pendingReviews,
          meetingsThisWeek,
          repEarned,
          pendingApplications,
          acceptedApplications,
          rejectedApplications
        },
        upcomingMeetings,
        requests,
        notifications,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Mentor Requests
const getMentorRequestsList = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const requests = await MentorRequest.find({ mentorId: req.user._id })
      .populate({
        path: 'projectId',
        populate: {
          path: 'owner members.userId',
          select: 'name email avatar college reputation skills bio'
        }
      })
      .populate('senderId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { requests }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Assigned Projects Workspace Directory
const getAssignedProjects = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const projects = await Project.find({ mentorId: req.user._id })
      .populate('owner', 'name email avatar college reputation bio')
      .populate('members.userId', 'name email avatar college reputation bio');

    // Retrieve pending review status & next meetings metadata for each card
    const projectsWithMeta = await Promise.all(projects.map(async (project) => {
      const nextMeeting = await Meeting.findOne({ projectId: project._id, status: 'Scheduled' })
        .sort({ dateTime: 1 })
        .select('title dateTime meetLink');

      const reviewsCount = await MentorReview.countDocuments({ projectId: project._id });

      return {
        ...project.toObject(),
        nextMeeting,
        reviewsCount
      };
    }));

    res.status(200).json({
      status: 'success',
      data: { projects: projectsWithMeta }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Milestone Reviews Actions
const submitMilestoneReview = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const { projectId, feedback, rating, milestoneStatus } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    const normalizedStatus = milestoneStatus?.toLowerCase(); // 'approved', 'rejected', 'resubmission_requested'

    const review = await MentorReview.create({
      projectId,
      mentorId: req.user._id,
      feedback,
      rating,
      milestoneStatus: normalizedStatus,
    });

    const io = req.app.get('io');

    // REP Engine Integration: awards +15 REP to ALL project members automatically on approval
    if (normalizedStatus === 'approved') {
      // Award Project Owner
      await emitEvent(io, 'MILESTONE_APPROVED', {
        projectId,
        actorId: req.user._id,
        recipientId: project.owner,
        targetId: review._id,
        targetType: 'MentorReview',
        points: 15,
        title: 'Milestone Approved! 🏆',
        message: `Your project milestone for "${project.title}" was approved by mentor. (+15 REP)`,
        link: `/projects/${projectId}`,
        actionText: `approved a project milestone for "${project.title}"`
      });

      // Award Project Team Members
      for (const m of project.members) {
        if (m.userId.toString() !== project.owner.toString()) {
          await emitEvent(io, 'MILESTONE_APPROVED', {
            projectId,
            actorId: req.user._id,
            recipientId: m.userId,
            targetId: review._id,
            targetType: 'MentorReview',
            points: 15,
            title: 'Milestone Approved! 🏆',
            message: `Your project milestone for "${project.title}" was approved by mentor. (+15 REP)`,
            link: `/projects/${projectId}`,
            actionText: `approved a project milestone for "${project.title}"`
          });
        }
      }
    } else {
      // Notify status updates
      await emitEvent(io, 'MILESTONE_REVIEW_COMPLETED', {
        projectId,
        actorId: req.user._id,
        recipientId: project.owner,
        targetId: review._id,
        targetType: 'MentorReview',
        title: normalizedStatus === 'resubmission_requested' ? 'Resubmission Requested ⚠️' : 'Milestone Rejected ❌',
        message: `Mentor reviewed milestone for "${project.title}" with status: ${milestoneStatus}`,
        link: `/projects/${projectId}`,
        actionText: `reviewed milestone for "${project.title}" as ${milestoneStatus}`
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Review successfully processed.',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Meetings Management APIs
const getMentorMeetings = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const meetings = await Meeting.find({ mentorId: req.user._id })
      .populate('projectId', 'title')
      .populate('attendance', 'name email avatar')
      .sort({ dateTime: -1 });

    res.status(200).json({
      status: 'success',
      data: { meetings }
    });
  } catch (error) {
    next(error);
  }
};

const createMentorMeeting = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const { projectId, title, description, dateTime, meetLink } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project workspace not found.', 404));

    const meeting = await Meeting.create({
      projectId,
      mentorId: req.user._id,
      title,
      description: description || '',
      dateTime,
      meetLink: meetLink || '',
      status: 'Scheduled',
    });

    const io = req.app.get('io');
    
    // Notify team members
    await emitEvent(io, 'MEETING_SCHEDULED', {
      projectId,
      actorId: req.user._id,
      recipientId: project.owner,
      targetId: meeting._id,
      targetType: 'Meeting',
      title: 'Huddle Meeting Scheduled 📅',
      message: `Mentor scheduled huddle: "${title}" for ${new Date(dateTime).toLocaleString()}`,
      link: `/teams/${project.team || project._id}`,
      actionText: `scheduled meeting "${title}" for project "${project.title}"`
    });

    for (const m of project.members) {
      if (m.userId.toString() !== project.owner.toString()) {
        await emitEvent(io, 'MEETING_SCHEDULED', {
          projectId,
          actorId: req.user._id,
          recipientId: m.userId,
          targetId: meeting._id,
          targetType: 'Meeting',
          title: 'Huddle Meeting Scheduled 📅',
          message: `Mentor scheduled huddle: "${title}" for ${new Date(dateTime).toLocaleString()}`,
          link: `/teams/${project.team || project._id}`,
          actionText: `scheduled meeting "${title}" for project "${project.title}"`
        });
      }
    }

    res.status(201).json({
      status: 'success',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

const updateMentorMeeting = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const { meetingId } = req.params;
    const { title, description, dateTime, meetLink, status, notes, attendance } = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return next(new AppError('Meeting not found.', 404));

    if (title !== undefined) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (dateTime !== undefined) meeting.dateTime = dateTime;
    if (meetLink !== undefined) meeting.meetLink = meetLink;
    if (status !== undefined) meeting.status = status;
    if (notes !== undefined) meeting.notes = notes;
    if (attendance !== undefined) meeting.attendance = attendance;

    await meeting.save();

    const project = await Project.findById(meeting.projectId);
    const io = req.app.get('io');

    if (project) {
      const eventType = status === 'Cancelled' ? 'MEETING_CANCELLED' : 'MEETING_UPDATED';
      const eventTitle = status === 'Cancelled' ? 'Meeting Cancelled ❌' : 'Meeting Details Updated 📅';
      const eventMsg = status === 'Cancelled' 
        ? `Meeting "${meeting.title}" has been cancelled.` 
        : `Meeting "${meeting.title}" details have been updated.`;

      await emitEvent(io, eventType, {
        projectId: project._id,
        actorId: req.user._id,
        recipientId: project.owner,
        targetId: meeting._id,
        targetType: 'Meeting',
        title: eventTitle,
        message: eventMsg,
        link: `/teams/${project.team || project._id}`,
        actionText: `updated meeting "${meeting.title}" for "${project.title}"`
      });

      for (const m of project.members) {
        if (m.userId.toString() !== project.owner.toString()) {
          await emitEvent(io, eventType, {
            projectId: project._id,
            actorId: req.user._id,
            recipientId: m.userId,
            targetId: meeting._id,
            targetType: 'Meeting',
            title: eventTitle,
            message: eventMsg,
            link: `/teams/${project.team || project._id}`,
            actionText: `updated meeting "${meeting.title}" for "${project.title}"`
          });
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Mentor Analytics API
const getMentorAnalytics = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const mentorId = req.user._id;

    const assignedCount = await Project.countDocuments({ mentorId });
    const completionCount = await Project.countDocuments({ mentorId, status: 'Completed' });
    const pendingReviewsCount = await MentorRequest.countDocuments({ mentorId, status: 'Pending' });

    const reviews = await MentorReview.find({ mentorId });
    const avgRating = reviews.length > 0 
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 5.0;

    res.status(200).json({
      status: 'success',
      data: {
        assignedCount,
        completionCount,
        pendingReviewsCount,
        avgRating,
        totalReviews: reviews.length,
        repPointsAwarded: reviews.filter(r => r.milestoneStatus === 'approved').length * 15
      }
    });
  } catch (error) {
    next(error);
  }
};

// 7. Mentor Marketplace API (shows projects without mentors)
const getMentorMarketplace = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const projects = await Project.find({
      mentorId: null,
      status: { $nin: ['Completed', 'Draft', 'Archived'] }
    })
      .populate('owner', 'name email avatar college reputation bio')
      .populate('members.userId', 'name email avatar college reputation bio');

    // Find all applications submitted by this mentor
    const myApps = await MentorApplication.find({ mentorId: req.user._id });
    const appliedProjectIds = new Set(myApps.map(a => a.projectId.toString()));

    const projectsWithApplyStatus = projects.map(p => {
      const pObj = p.toObject();
      pObj.hasApplied = appliedProjectIds.has(p._id.toString());
      // Get the application status if applied
      const app = myApps.find(a => a.projectId.toString() === p._id.toString());
      pObj.applicationStatus = app ? app.status : null;
      return pObj;
    });

    res.status(200).json({
      status: 'success',
      data: { projects: projectsWithApplyStatus }
    });
  } catch (error) {
    next(error);
  }
};

// 8. Apply as Mentor
const applyAsMentor = async (req, res, next) => {
  try {
    checkIsMentor(req, next);
    const { projectId } = req.params;
    const { message, expertise, experience, availability, expectedContribution } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    if (project.mentorId) {
      return next(new AppError('This project already has an assigned mentor.', 400));
    }

    const application = await MentorApplication.create({
      projectId,
      mentorId: req.user._id,
      message,
      expertise,
      experience,
      availability,
      expectedContribution,
      status: 'Pending'
    });

    const io = req.app.get('io');

    // Notify Project Owner
    await emitEvent(io, 'MENTOR_APPLICATION_SUBMITTED', {
      projectId,
      actorId: req.user._id,
      recipientId: project.owner,
      targetId: application._id,
      targetType: 'MentorApplication',
      title: 'New Mentor Application 🎓',
      message: `${req.user.name} applied to mentor your project "${project.title}"`,
      link: `/projects/${projectId}`,
      actionText: `applied to mentor project "${project.title}"`
    });

    // Create Activity Log
    await ActivityLog.create({
      projectId,
      actorId: req.user._id,
      action: `Applied to mentor project "${project.title}"`
    });

    res.status(201).json({
      status: 'success',
      data: { application }
    });
  } catch (error) {
    next(error);
  }
};

// 9. Bookmark / Unbookmark Project
const bookmarkProject = async (req, res, next) => {
  try {
    checkIsMentor(req, next);
    const { projectId } = req.params;

    const existing = await Bookmark.findOne({
      userId: req.user._id,
      targetType: 'project',
      targetId: projectId
    });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        status: 'success',
        message: 'Project bookmark removed.'
      });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      targetType: 'project',
      targetId: projectId
    });

    res.status(201).json({
      status: 'success',
      data: { bookmark }
    });
  } catch (error) {
    next(error);
  }
};

// 10. Get Bookmarked Projects
const getBookmarkedProjects = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const bookmarks = await Bookmark.find({
      userId: req.user._id,
      targetType: 'project'
    });

    const projectIds = bookmarks.map(b => b.targetId);
    const projects = await Project.find({ _id: { $in: projectIds } })
      .populate('owner', 'name email avatar college reputation bio')
      .populate('members.userId', 'name email avatar college reputation bio');

    res.status(200).json({
      status: 'success',
      data: { projects }
    });
  } catch (error) {
    next(error);
  }
};

// 11. Resolve Completion / Final Project Approval
const resolveProjectCompletion = async (req, res, next) => {
  try {
    checkIsMentor(req, next);
    const { projectId } = req.params;
    const { action, feedback } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    if (project.mentorId?.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You are not authorized to resolve completion for this project.', 403));
    }

    const io = req.app.get('io');

    if (action === 'approve') {
      project.status = 'Completed';
      await project.save();

      // Award REP points (+50 REP) to Owner
      await emitEvent(io, 'PROJECT_COMPLETED_APPROVAL', {
        projectId,
        actorId: req.user._id,
        recipientId: project.owner,
        targetId: project._id,
        targetType: 'Project',
        points: 50,
        title: 'Project Completion Approved! 🎓🏆',
        message: `Your project "${project.title}" completion request was approved by mentor. (+50 REP)`,
        link: `/projects/${projectId}`,
        actionText: `approved final project completion for "${project.title}"`
      });

      // Award to members
      for (const m of project.members) {
        if (m.userId && m.userId.toString() !== project.owner.toString()) {
          await emitEvent(io, 'PROJECT_COMPLETED_APPROVAL', {
            projectId,
            actorId: req.user._id,
            recipientId: m.userId,
            targetId: project._id,
            targetType: 'Project',
            points: 50,
            title: 'Project Completion Approved! 🎓🏆',
            message: `Your project "${project.title}" completion request was approved by mentor. (+50 REP)`,
            link: `/projects/${projectId}`,
            actionText: `approved final project completion for "${project.title}"`
          });
        }
      }

      // Log completion to timeline
      await ActivityLog.create({
        projectId,
        actorId: req.user._id,
        action: `Approved final project completion for "${project.title}"`
      });

    } else {
      project.status = 'In Progress';
      await project.save();

      // Notify owner of rejection
      await emitEvent(io, 'PROJECT_COMPLETED_REJECTED', {
        projectId,
        actorId: req.user._id,
        recipientId: project.owner,
        targetId: project._id,
        targetType: 'Project',
        title: 'Project Completion Declined ❌',
        message: `Mentor declined completion for "${project.title}". Feedback: ${feedback}`,
        link: `/projects/${projectId}`,
        actionText: `declined final project completion for "${project.title}"`
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Project completion resolved successfully. Status updated to ${project.status}`,
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

// 12. List applications for a project (called by project owner)
const getProjectMentorApplications = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Only the project owner can view mentor applications.', 403));
    }

    const applications = await MentorApplication.find({ projectId })
      .populate('mentorId', 'name email avatar bio skills reputation availabilityStatus company experienceYears')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { applications }
    });
  } catch (error) {
    next(error);
  }
};

// 13. Resolve Mentor Application (Accept/Reject, called by project owner)
const resolveMentorApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body; // 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      return next(new AppError('Invalid application resolution status.', 400));
    }

    const application = await MentorApplication.findById(applicationId).populate('projectId');
    if (!application) return next(new AppError('Application not found.', 404));

    const project = application.projectId;
    if (!project) return next(new AppError('Project not found or deleted.', 404));
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Only the project owner can resolve applications.', 403));
    }

    application.status = status;
    if (status === 'Rejected') {
      application.rejectionReason = rejectionReason || '';
    }
    await application.save();

    const io = req.app.get('io');

    if (status === 'Accepted') {
      project.mentorId = application.mentorId;
      await project.save();

      // Notify mentor of acceptance
      await emitEvent(io, 'MENTOR_APPLICATION_ACCEPTED', {
        projectId: project._id,
        actorId: req.user._id,
        recipientId: application.mentorId,
        targetId: application._id,
        targetType: 'MentorApplication',
        title: 'Mentor Accepted 🎉',
        message: `Your application to mentor "${project.title}" has been accepted by the owner. Workspace access granted.`,
        link: `/mentor/projects`,
        actionText: `accepted mentor application for "${project.title}"`
      });

      // Create Activity Log
      await ActivityLog.create({
        projectId: project._id,
        actorId: req.user._id,
        action: `Mentor Accepted and Workspace Access Granted`
      });
    } else {
      // Notify mentor of rejection
      await emitEvent(io, 'MENTOR_APPLICATION_REJECTED', {
        projectId: project._id,
        actorId: req.user._id,
        recipientId: application.mentorId,
        targetId: application._id,
        targetType: 'MentorApplication',
        title: 'Application Rejected ❌',
        message: `Your application to mentor "${project.title}" was rejected. Reason: ${rejectionReason || 'No reason specified'}`,
        link: `/mentor/applications`,
        actionText: `declined mentor application for "${project.title}"`
      });

      // Create Activity Log
      await ActivityLog.create({
        projectId: project._id,
        actorId: req.user._id,
        action: `Mentor Rejected: ${rejectionReason || 'No reason specified'}`
      });
    }

    res.status(200).json({
      status: 'success',
      data: { application }
    });
  } catch (error) {
    next(error);
  }
};

// 14. Get Mentor's Own Applications list
const getMyMentorApplications = async (req, res, next) => {
  try {
    checkIsMentor(req, next);

    const applications = await MentorApplication.find({ mentorId: req.user._id })
      .populate({
        path: 'projectId',
        populate: {
          path: 'owner',
          select: 'name email avatar bio college'
        }
      })
      .sort({ createdAt: -1 });

    const projects = await Project.find({ mentorId: req.user._id })
      .populate('owner', 'name email avatar bio college');

    // Create a set of project IDs that already have application documents
    const appliedProjectIds = new Set(
      applications.map(app => app.projectId ? (app.projectId._id || app.projectId).toString() : '')
    );

    // Synthesize "Accepted" applications for assigned projects that don't have database application records
    const synthesizedApps = [];
    for (const project of projects) {
      if (!appliedProjectIds.has(project._id.toString())) {
        synthesizedApps.push({
          _id: `synth-${project._id}`,
          projectId: project,
          mentorId: req.user._id,
          status: 'Accepted',
          message: 'Direct assignment as project mentor.',
          expertise: project.skills?.join(', ') || 'General',
          experience: 'N/A',
          availability: 'Flexible',
          expectedContribution: 'Workspace mentoring',
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        });
      }
    }

    const combinedApplications = [...applications, ...synthesizedApps];

    res.status(200).json({
      status: 'success',
      data: { applications: combinedApplications }
    });
  } catch (error) {
    next(error);
  }
};

// 15. Withdraw Mentor Application
const withdrawMentorApplication = async (req, res, next) => {
  try {
    checkIsMentor(req, next);
    const { applicationId } = req.params;

    const application = await MentorApplication.findById(applicationId).populate('projectId');
    if (!application) return next(new AppError('Application not found.', 404));

    if (application.mentorId.toString() !== req.user._id.toString()) {
      return next(new AppError('You did not submit this application.', 403));
    }

    const project = application.projectId;

    application.status = 'Withdrawn';
    await application.save();

    if (project) {
      const io = req.app.get('io');

      // Notify Project Owner
      await emitEvent(io, 'MENTOR_APPLICATION_WITHDRAWN', {
        projectId: project._id,
        actorId: req.user._id,
        recipientId: project.owner,
        targetId: application._id,
        targetType: 'MentorApplication',
        title: 'Mentor Withdrawn ⚠️',
        message: `${req.user.name} withdrew their application to mentor "${project.title}"`,
        link: `/projects/${project._id}`,
        actionText: `withdrew mentor application for "${project.title}"`
      });

      // Create Activity Log
      await ActivityLog.create({
        projectId: project._id,
        actorId: project.owner,
        action: `Mentor Withdrew application`
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Application withdrawn successfully.',
      data: { application }
    });
  } catch (error) {
    next(error);
  }
};

// 16. Reapply Mentor Application
const reapplyMentorApplication = async (req, res, next) => {
  try {
    checkIsMentor(req, next);
    const { applicationId } = req.params;
    const { message, expertise, experience, availability, expectedContribution } = req.body;

    const application = await MentorApplication.findById(applicationId).populate('projectId');
    if (!application) return next(new AppError('Application not found.', 404));

    if (application.mentorId.toString() !== req.user._id.toString()) {
      return next(new AppError('You did not submit this application.', 403));
    }

    const project = application.projectId;
    if (project.mentorId) {
      return next(new AppError('This project already has an assigned mentor.', 400));
    }

    application.status = 'Pending';
    application.message = message || application.message;
    application.expertise = expertise || application.expertise;
    application.experience = experience || application.experience;
    application.availability = availability || application.availability;
    application.expectedContribution = expectedContribution || application.expectedContribution;
    application.rejectionReason = '';

    await application.save();

    const io = req.app.get('io');

    // Notify Project Owner
    await emitEvent(io, 'MENTOR_APPLICATION_SUBMITTED', {
      projectId: project._id,
      actorId: req.user._id,
      recipientId: project.owner,
      targetId: application._id,
      targetType: 'MentorApplication',
      title: 'New Mentor Application 🎓',
      message: `${req.user.name} applied to mentor your project "${project.title}"`,
      link: `/projects/${project._id}`,
      actionText: `applied to mentor project "${project.title}"`
    });

    // Create Activity Log
    await ActivityLog.create({
      projectId: project._id,
      actorId: req.user._id,
      action: `Applied to mentor project "${project.title}"`
    });

    res.status(200).json({
      status: 'success',
      message: 'Reapplied successfully.',
      data: { application }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMentorDashboard,
  getMentorRequestsList,
  getAssignedProjects,
  submitMilestoneReview,
  getMentorMeetings,
  createMentorMeeting,
  updateMentorMeeting,
  getMentorAnalytics,
  getMentorMarketplace,
  applyAsMentor,
  bookmarkProject,
  getBookmarkedProjects,
  resolveProjectCompletion,
  getProjectMentorApplications,
  resolveMentorApplication,
  getMyMentorApplications,
  withdrawMentorApplication,
  reapplyMentorApplication,
};
