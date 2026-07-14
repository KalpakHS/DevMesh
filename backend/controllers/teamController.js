const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const WorkspaceFile = require('../models/WorkspaceFile');
const Note = require('../models/Note');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');
const RepEvent = require('../models/RepEvent');
const AppError = require('../utils/appError');
const fs = require('fs');
const { useCloudinary, cloudinary } = require('../config/cloudinary');
const { emitEvent } = require('../services/eventService');

const uploadToStorage = async (file) => {
  if (!file) return '';
  if (useCloudinary) {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'devmesh/files',
    });
    fs.unlinkSync(file.path);
    return result.secure_url;
  }
  return `/uploads/${file.filename}`;
};

const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [
        { 'members.user': req.user._id },
        { owner: req.user._id }
      ]
    })
      .populate('project', 'title category status')
      .populate('owner', 'name avatar');

    res.status(200).json({
      status: 'success',
      data: { teams },
    });
  } catch (error) {
    next(error);
  }
};

const getTeamDetails = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'project',
        select: 'title category status deadline description repoUrl demoUrl owner mentorId meetingUrl',
        populate: {
          path: 'mentorId',
          select: 'name email avatar bio availabilityStatus role'
        }
      })
      .populate('members.user', 'name email avatar bio role availabilityStatus');

    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    // Verify requesting user is member of the team or the project's mentor
    const isMember = team.members.some((m) => m.user && (m.user._id || m.user).toString() === req.user._id.toString());
    const isMentor = team.project?.mentorId && team.project.mentorId.toString() === req.user._id.toString();

    if (!isMember && !isMentor && req.user.role !== 'Admin') {
      return next(new AppError('You are not authorized to access this team workspace.', 403));
    }

    // Query standalone data collections
    const projectId = team.project._id;
    const tasks = await Task.find({ projectId }).populate('assigneeId', 'name avatar').sort({ order: 1 });
    const files = await WorkspaceFile.find({ projectId }).populate('uploadedBy', 'name avatar');
    const notes = await Note.find({ projectId }).populate('authorId', 'name avatar').sort({ createdAt: -1 });
    const announcements = await Announcement.find({ projectId }).populate('authorId', 'name avatar').sort({ pinned: -1, createdAt: -1 });
    const activityLogs = await ActivityLog.find({ projectId }).populate('actorId', 'name avatar').sort({ createdAt: -1 });

    const repEvents = await RepEvent.find({ projectId }).populate('userId', 'name avatar');

    const teamObj = team.toObject();
    teamObj.tasks = tasks;
    teamObj.files = files;
    teamObj.notes = notes;
    teamObj.announcements = announcements;
    teamObj.activityLogs = activityLogs;
    teamObj.repEvents = repEvents;

    res.status(200).json({
      status: 'success',
      data: { team: teamObj },
    });
  } catch (error) {
    next(error);
  }
};

const addTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'Admin') {
      return next(new AppError('You are not authorized to add tasks to this team.', 403));
    }

    const taskCount = await Task.countDocuments({ projectId: team.project });

    const newTask = await Task.create({
      projectId: team.project,
      title,
      description,
      assigneeId: assignedTo || null,
      status: 'todo',
      createdBy: req.user._id,
      dueDate: dueDate || null,
      order: taskCount,
    });

    // Legacy sync
    const embeddedStatusMap = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done'
    };
    team.tasks.push({
      title,
      description,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      status: 'To Do',
    });
    await team.save();

    // Event Matrix
    const io = req.app.get('io');
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await emitEvent(io, 'TASK_ASSIGNED', {
        projectId: team.project,
        actorId: req.user._id,
        recipientId: assignedTo,
        targetId: newTask._id,
        targetType: 'Task',
        title: 'New Task Assigned 🎯',
        message: `You were assigned the task "${title}" in workspace "${team.project.title}"`,
        link: `/teams/${team._id}`,
        actionText: `assigned task "${title}" to teammate`
      });
    }

    const populatedTask = await Task.findById(newTask._id).populate('assigneeId', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: { task: populatedTask },
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedTo, status, dueDate, order } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'Admin') {
      return next(new AppError('You are not authorized to update tasks in this team.', 403));
    }

    let task = await Task.findById(taskId);
    if (!task) {
      task = await Task.findOne({ projectId: team.project, title: title });
    }

    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }

    const oldStatus = task.status;
    
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assigneeId = assignedTo || null;
    if (status !== undefined) task.status = status.toLowerCase();
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (order !== undefined) task.order = order;

    await task.save();

    // Legacy sync
    const embeddedStatusMap = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done'
    };
    const legacyTask = team.tasks.id(taskId) || team.tasks.find(t => t.title === title);
    if (legacyTask) {
      if (title !== undefined) legacyTask.title = title;
      if (description !== undefined) legacyTask.description = description;
      if (assignedTo !== undefined) legacyTask.assignedTo = assignedTo || null;
      if (status !== undefined) legacyTask.status = embeddedStatusMap[status.toLowerCase()] || status;
      if (dueDate !== undefined) legacyTask.dueDate = dueDate || null;
      await team.save();
    }

    const io = req.app.get('io');

    if (status && status.toLowerCase() !== oldStatus) {
      if (['review', 'done'].includes(status.toLowerCase()) && task.createdBy.toString() !== req.user._id.toString()) {
        await emitEvent(io, 'TASK_STATUS_CHANGED', {
          projectId: team.project,
          actorId: req.user._id,
          recipientId: task.createdBy,
          targetId: task._id,
          targetType: 'Task',
          title: 'Task Status Updated ⚡',
          message: `The task "${task.title}" is now "${status}"`,
          link: `/teams/${team._id}`,
          actionText: `moved task "${task.title}" to ${status}`
        });
      }

      if (status.toLowerCase() === 'done' && task.assigneeId) {
        await emitEvent(io, 'TASK_COMPLETED', {
          projectId: team.project,
          actorId: req.user._id,
          recipientId: task.assigneeId,
          targetId: task._id,
          targetType: 'Task',
          points: 2,
          title: 'Task Completed! 🏆',
          message: `You completed "${task.title}" and earned 2 reputation points.`,
          link: `/teams/${team._id}`,
          actionText: `completed task "${task.title}"`
        });
      }
    }

    const populatedTask = await Task.findById(task._id).populate('assigneeId', 'name avatar');

    res.status(200).json({
      status: 'success',
      data: { task: populatedTask },
    });
  } catch (error) {
    next(error);
  }
};

const uploadTeamFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a file to upload.', 400));
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'Admin') {
      return next(new AppError('You are not authorized to upload files to this team.', 403));
    }

    const fileUrl = await uploadToStorage(req.file);

    const newFile = await WorkspaceFile.create({
      projectId: team.project,
      uploadedBy: req.user._id,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype || 'application/octet-stream',
    });

    // Legacy sync
    team.files.push({
      name: req.file.originalname,
      url: fileUrl,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    });
    await team.save();

    // Event Matrix
    const io = req.app.get('io');
    await emitEvent(io, 'FILE_UPLOADED', {
      projectId: team.project,
      actorId: req.user._id,
      targetId: newFile._id,
      targetType: 'WorkspaceFile',
      actionText: `uploaded a workspace document: "${req.file.originalname}"`
    });

    const populatedFile = await WorkspaceFile.findById(newFile._id).populate('uploadedBy', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: { file: populatedFile },
    });
  } catch (error) {
    next(error);
  }
};

const inviteUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const teamId = req.params.id;

    const team = await Team.findById(teamId).populate('project', 'title');
    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    // Verify requester is Owner/Admin in the team
    const requester = team.members.find((m) => m.user.toString() === req.user._id.toString());
    if ((!requester || !['Owner', 'Admin'].includes(requester.role)) && req.user.role !== 'Admin') {
      return next(new AppError('You must be a team owner or admin to invite members.', 403));
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return next(new AppError('No user registered with this email address.', 404));
    }

    // Check if target user is already in the team
    const alreadyMember = team.members.some((m) => m.user.toString() === targetUser._id.toString());
    if (alreadyMember) {
      return next(new AppError('User is already a member of this team.', 400));
    }

    // Create an invitation notification
    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'Invitation',
      title: 'Project Invitation 📨',
      message: `${req.user.name} invited you to join the team for "${team.project.title}"`,
      link: `/teams/${team._id}`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Invitation notification dispatched successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const resolveInvitation = async (req, res, next) => {
  try {
    const { notiId, action } = req.params; // action = 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return next(new AppError('Invalid action. Must be accept or reject.', 400));
    }

    const notification = await Notification.findById(notiId);
    if (!notification || notification.recipient.toString() !== req.user._id.toString()) {
      return next(new AppError('Invitation not found or unauthorized.', 404));
    }

    // Extract team ID from the link: "/teams/TEAM_ID"
    const teamId = notification.link.split('/').pop();
    const team = await Team.findById(teamId).populate('project', 'title');
    if (!team) {
      return next(new AppError('Team associated with this invitation no longer exists.', 404));
    }

    if (action === 'accept') {
      // 1. Add to Team
      const alreadyMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
      if (!alreadyMember) {
        team.members.push({
          user: req.user._id,
          role: 'Member',
          joinedAt: new Date(),
        });
        await team.save();
      }

      // 2. Add to Project
      const Project = require('../models/Project');
      const project = await Project.findById(team.project._id || team.project);
      if (project) {
        const alreadyProjMember = project.members.some((m) => m.userId.toString() === req.user._id.toString());
        if (!alreadyProjMember) {
          project.members.push({
            userId: req.user._id,
            role: 'member',
            joinedAt: new Date()
          });
          await project.save();
        }
      }

      // 3. Central Event Matrix Logging & Rep (Collab +5 REP points as per specifications)
      const io = req.app.get('io');
      await emitEvent(io, 'INVITATION_ACCEPTED', {
        projectId: team.project._id || team.project,
        actorId: req.user._id,
        recipientId: team.owner,
        targetId: team._id,
        targetType: 'Team',
        points: 5,
        title: 'Invitation Accepted! 🎉',
        message: `${req.user.name} accepted your invitation to join "${team.project?.title || 'Project'}"`,
        link: `/teams/${team._id}`,
        actionText: `accepted the invitation to join project "${team.project?.title || 'Project'}"`
      });
    }

    // Delete the original invitation notification
    await Notification.findByIdAndDelete(notiId);

    res.status(200).json({
      status: 'success',
      message: `Invitation successfully ${action}ed.`,
    });
  } catch (error) {
    next(error);
  }
};

const addNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return next(new AppError('No team workspace found.', 404));

    const note = await Note.create({
      projectId: team.project,
      authorId: req.user._id,
      content,
    });

    const io = req.app.get('io');
    await emitEvent(io, 'NOTE_CREATED', {
      projectId: team.project,
      actorId: req.user._id,
      targetId: note._id,
      targetType: 'Note',
      actionText: `created a workspace scratch note`
    });

    const populatedNote = await Note.findById(note._id).populate('authorId', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: { note: populatedNote },
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) return next(new AppError('No note found.', 404));

    if (note.authorId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not own this note.', 403));
    }

    await Note.findByIdAndDelete(noteId);
    res.status(200).json({ status: 'success', message: 'Note deleted.' });
  } catch (error) {
    next(error);
  }
};

const addAnnouncement = async (req, res, next) => {
  try {
    const { content, pinned } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return next(new AppError('No team workspace found.', 404));

    const requester = team.members.find((m) => m.user.toString() === req.user._id.toString());
    if ((!requester || !['Owner', 'Admin'].includes(requester.role)) && req.user.role !== 'Admin') {
      return next(new AppError('Unauthorized to publish announcements.', 403));
    }

    const announcement = await Announcement.create({
      projectId: team.project,
      authorId: req.user._id,
      content,
      pinned: pinned || false,
    });

    const io = req.app.get('io');
    await emitEvent(io, 'ANNOUNCEMENT_POSTED', {
      projectId: team.project,
      actorId: req.user._id,
      targetId: announcement._id,
      targetType: 'Announcement',
      actionText: `posted a workspace announcement: "${content.substring(0, 40)}..."`
    });

    const populatedAnn = await Announcement.findById(announcement._id).populate('authorId', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: { announcement: populatedAnn },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const { annId } = req.params;
    const announcement = await Announcement.findById(annId);
    if (!announcement) return next(new AppError('No announcement found.', 404));

    if (announcement.authorId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Unauthorized.', 403));
    }

    await Announcement.findByIdAndDelete(annId);
    res.status(200).json({ status: 'success', message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- TEAM MANAGEMENT EXPORT CONTROLLERS ---

const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return next(new AppError('No team workspace found.', 404));

    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Unauthorized. Only project owners can manage members.', 403));
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return next(new AppError('Specified user does not exist.', 404));

    // Add to Team members list
    const alreadyTeamMember = team.members.some((m) => m.user.toString() === userId.toString());
    if (!alreadyTeamMember) {
      team.members.push({
        user: userId,
        role: role || 'Member',
        joinedAt: new Date(),
      });
      await team.save();
    }

    // Add to Project members list
    const project = await Project.findById(team.project);
    if (project) {
      const alreadyProjMember = project.members.some((m) => m.userId.toString() === userId.toString());
      if (!alreadyProjMember) {
        project.members.push({
          userId,
          role: role?.toLowerCase() === 'admin' ? 'leader' : 'member',
          joinedAt: new Date(),
        });
        await project.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Member added to team workspace successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body; // 'Admin' (Team Leader) or 'Member'

    if (!['Admin', 'Member'].includes(role)) {
      return next(new AppError('Invalid role. Must be Admin or Member.', 400));
    }

    const team = await Team.findById(req.params.id);
    if (!team) return next(new AppError('No team workspace found.', 404));

    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Unauthorized.', 403));
    }

    const memberIdx = team.members.findIndex((m) => m.user.toString() === userId.toString());
    if (memberIdx === -1) return next(new AppError('User is not a member of this team.', 404));

    team.members[memberIdx].role = role;
    await team.save();

    // Sync to Project roles
    const project = await Project.findById(team.project);
    if (project) {
      const projMemberIdx = project.members.findIndex((m) => m.userId.toString() === userId.toString());
      if (projMemberIdx !== -1) {
        project.members[projMemberIdx].role = role === 'Admin' ? 'leader' : 'member';
        await project.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Member role successfully updated to ${role}.`,
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const team = await Team.findById(req.params.id);
    if (!team) return next(new AppError('No team workspace found.', 404));

    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Unauthorized.', 403));
    }

    // Remove from Team
    team.members = team.members.filter((m) => m.user.toString() !== userId.toString());
    await team.save();

    // Remove from Project
    const project = await Project.findById(team.project);
    if (project) {
      project.members = project.members.filter((m) => m.userId.toString() !== userId.toString());
      await project.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Member removed from team workspace successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const closeProjectWorkspace = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return next(new AppError('No team workspace found.', 404));

    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Unauthorized.', 403));
    }

    const project = await Project.findById(team.project);
    if (project) {
      project.status = 'Completed';
      await project.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Project workspace successfully closed & completed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTeams,
  getTeamDetails,
  addTask,
  updateTask,
  uploadTeamFile,
  inviteUser,
  resolveInvitation,
  addNote,
  deleteNote,
  addAnnouncement,
  deleteAnnouncement,
  addMember,
  updateMemberRole,
  removeMember,
  closeProjectWorkspace,
};
