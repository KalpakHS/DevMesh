const Project = require('../models/Project');
const Team = require('../models/Team');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { emitEvent } = require('../services/eventService');

const getProjects = async (req, res, next) => {
  try {
    const { category, status, skills, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillsArray };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skipIdx = (page - 1) * limit;

    const projects = await Project.find(query)
      .populate('owner', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skipIdx)
      .limit(parseInt(limit));

    const totalProjects = await Project.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: projects.length,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: parseInt(page),
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, category, deadline, rolesNeeded, skills, repoUrl, demoUrl, visibility, difficulty, workMode, numOpenings, experienceLevel, duration } = req.body;

    const newProject = await Project.create({
      title,
      description,
      category,
      deadline,
      rolesNeeded: rolesNeeded || [],
      skills: skills || [],
      skillsRequired: skills || [],
      repoUrl,
      demoUrl,
      owner: req.user._id,
      ownerId: req.user._id,
      visibility: visibility || 'public',
      difficulty: difficulty || 'intermediate',
      workMode: workMode || 'remote',
      numOpenings: numOpenings || 1,
      experienceLevel: experienceLevel || 'Intermediate',
      duration: duration || '1 Month',
      members: [
        {
          userId: req.user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    // Create the associated Team
    const newTeam = await Team.create({
      project: newProject._id,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Owner',
          joinedAt: new Date(),
        },
      ],
    });

    // Update project reference
    newProject.team = newTeam._id;
    await newProject.save();

    // Reward owner (+10 reputation points) through centralized emitEvent
    const io = req.app.get('io');
    await emitEvent(io, 'PROJECT_PUBLISHED', {
      projectId: newProject._id,
      actorId: req.user._id,
      recipientId: req.user._id,
      targetId: newProject._id,
      targetType: 'Project',
      points: 10,
      title: 'Project Published! 🚀',
      message: `You successfully published project "${title}" and earned 10 REP.`,
      link: `/projects/${newProject._id}`,
      actionText: `published a new project workspace: "${title}"`
    });

    res.status(201).json({
      status: 'success',
      data: { project: newProject },
    });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar role bio reputation')
      .populate({
        path: 'team',
        populate: {
          path: 'members.user',
          select: 'name avatar bio role',
        },
      });

    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not own this project.', 403));
    }

    const { title, description, category, status, deadline, rolesNeeded, skills, repoUrl, demoUrl, meetingUrl, visibility, difficulty, workMode, numOpenings, experienceLevel, duration } = req.body;
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (status) project.status = status;
    if (deadline) project.deadline = deadline;
    if (rolesNeeded) project.rolesNeeded = rolesNeeded;
    if (skills) project.skills = skills;
    if (repoUrl !== undefined) project.repoUrl = repoUrl;
    if (demoUrl !== undefined) project.demoUrl = demoUrl;
    if (meetingUrl !== undefined) project.meetingUrl = meetingUrl;
    if (visibility) project.visibility = visibility;
    if (difficulty) project.difficulty = difficulty;
    if (workMode) project.workMode = workMode;
    if (numOpenings !== undefined) project.numOpenings = numOpenings;
    if (experienceLevel) project.experienceLevel = experienceLevel;
    if (duration) project.duration = duration;

    await project.save();

    res.status(200).json({
      status: 'success',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not own this project.', 403));
    }

    await Project.findByIdAndDelete(req.params.id);
    // Delete associated Team and Applications
    await Team.findOneAndDelete({ project: req.params.id });
    await Application.deleteMany({ project: req.params.id });

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const applyToProject = async (req, res, next) => {
  try {
    const { role, coverLetter, resumeUrl, message } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Check if user is owner
    if (project.owner.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot apply to your own project.', 400));
    }

    // Check if user already applied to this role
    const existingApp = await Application.findOne({
      project: projectId,
      applicant: req.user._id,
      role: role,
    });
    if (existingApp) {
      return next(new AppError('You have already applied for this role.', 400));
    }

    const application = await Application.create({
      project: projectId,
      applicant: req.user._id,
      role: role,
      direction: 'applied',
      message: message || coverLetter || '',
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || req.user.resumeUrl || '',
    });

    // Notify project owner and log event
    const io = req.app.get('io');
    await emitEvent(io, 'APPLICATION_SUBMITTED', {
      projectId: project._id,
      actorId: req.user._id,
      recipientId: project.owner,
      targetId: application._id,
      targetType: 'Application',
      title: 'New Project Application 📝',
      message: `${req.user.name} applied for the role of ${role} in your project "${project.title}"`,
      link: `/projects/${project._id}/applications`,
      actionText: `applied for the role of ${role} in project "${project.title}"`
    });

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully!',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

const getProjectApplications = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not own this project.', 403));
    }

    const applications = await Application.find({ project: req.params.id })
      .populate('applicant', 'name email avatar bio reputation skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { status } = req.body; // 'Accepted', 'Rejected', 'Withdrawn', 'accepted', 'rejected', 'withdrawn'

    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    if (!['Accepted', 'Rejected', 'Withdrawn'].includes(normalizedStatus)) {
      return next(new AppError('Invalid application status.', 400));
    }

    const application = await Application.findById(appId).populate('project');
    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    const project = application.project;

    // Check permissions:
    // If direction is 'invited', the developer (applicant) must accept/decline.
    // If direction is 'applied', the project owner must accept/decline.
    if (application.direction === 'invited') {
      if (application.applicant.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return next(new AppError('You do not have permission to respond to this invitation.', 403));
      }
    } else {
      if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return next(new AppError('You do not have permission to manage this application.', 403));
      }
    }

    application.status = normalizedStatus;
    application.respondedAt = new Date();
    await application.save();

    const io = req.app.get('io');

    if (normalizedStatus === 'Accepted') {
      // 1. Add to Project members
      const projectObj = await Project.findById(project._id);
      if (projectObj) {
        const alreadyProjMember = projectObj.members.some(
          (m) => m.userId.toString() === application.applicant.toString()
        );
        if (!alreadyProjMember) {
          projectObj.members.push({
            userId: application.applicant,
            role: 'member',
            joinedAt: new Date(),
          });
          await projectObj.save();
        }
      }

      // 2. Add to Team members
      const team = await Team.findOne({ project: project._id });
      if (team) {
        const alreadyTeamMember = team.members.some(
          (m) => m.user.toString() === application.applicant.toString()
        );
        if (!alreadyTeamMember) {
          team.members.push({
            user: application.applicant,
            role: 'Member',
            joinedAt: new Date(),
          });
          await team.save();
        }
      }

      // 3. Mark the project role as 'Filled'
      const roleIdx = project.rolesNeeded.findIndex(
        (r) => r.roleName.toLowerCase() === application.role.toLowerCase() && r.status === 'Open'
      );
      if (roleIdx !== -1) {
        project.rolesNeeded[roleIdx].status = 'Filled';
        await project.save();
      }

      // 4. Emit Accepted Event (rewards +1 reputation point to applicant as per Section 3)
      if (application.direction === 'invited') {
        // Developer accepted owner's invitation
        await emitEvent(io, 'INVITATION_ACCEPTED', {
          projectId: project._id,
          actorId: req.user._id,
          recipientId: project.owner,
          targetId: application._id,
          targetType: 'Application',
          points: 1, // Developer gets 1 point
          title: 'Invitation Accepted! 🎉',
          message: `${req.user.name} accepted your invitation to join "${project.title}"`,
          link: `/teams/${project.team}`,
          actionText: `accepted the invitation to join project "${project.title}" as ${application.role}`
        });
      } else {
        // Owner accepted developer's application
        await emitEvent(io, 'APPLICATION_ACCEPTED', {
          projectId: project._id,
          actorId: req.user._id,
          recipientId: application.applicant,
          targetId: application._id,
          targetType: 'Application',
          points: 1, // Developer gets 1 point
          title: 'Application Accepted! 🎉',
          message: `Your application for the role of ${application.role} in "${project.title}" was accepted.`,
          link: `/teams/${project.team}`,
          actionText: `accepted ${application.role} application for project "${project.title}"`
        });
      }
    } else if (normalizedStatus === 'Rejected') {
      if (application.direction === 'invited') {
        // Developer declined invitation
        await emitEvent(io, 'INVITATION_REJECTED', {
          projectId: project._id,
          actorId: req.user._id,
          recipientId: project.owner,
          targetId: application._id,
          targetType: 'Application',
          title: 'Invitation Declined ❌',
          message: `${req.user.name} declined your invitation for "${project.title}"`,
          link: `/projects/${project._id}`,
          actionText: `declined invitation for project "${project.title}"`
        });
      } else {
        // Owner rejected application
        await emitEvent(io, 'APPLICATION_REJECTED', {
          projectId: project._id,
          actorId: req.user._id,
          recipientId: application.applicant,
          targetId: application._id,
          targetType: 'Application',
          title: 'Application Declined ❌',
          message: `Your application for "${project.title}" was declined.`,
          link: `/projects/${project._id}`,
          actionText: `declined ${application.role} application for project "${project.title}"`
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Application has been ${normalizedStatus.toLowerCase()} successfully.`,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

const inviteDeveloper = async (req, res, next) => {
  try {
    const { developerId, role, message } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not own this project.', 403));
    }

    // Check if already a member
    const isMember = project.members.some(
      (m) => m.userId.toString() === developerId.toString()
    );
    if (isMember) {
      return next(new AppError('This developer is already a member of this project.', 400));
    }

    const application = await Application.create({
      project: projectId,
      applicant: developerId,
      role: role,
      direction: 'invited',
      message: message || "Hi, I'd like to invite you to join my project!",
      status: 'Pending',
    });

    // Notify developer and log event
    const io = req.app.get('io');
    const devUser = await User.findById(developerId);
    if (devUser) {
      await emitEvent(io, 'INVITATION_RECEIVED', {
        projectId: project._id,
        actorId: req.user._id,
        recipientId: developerId,
        targetId: application._id,
        targetType: 'Application',
        title: 'Project Invitation Received 📨',
        message: `You have been invited to join the project "${project.title}" as ${role}`,
        link: `/projects/${project._id}`,
        actionText: `invited ${devUser.name} to join project "${project.title}" as ${role}`
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Invitation sent successfully!',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

const withdrawApplication = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const application = await Application.findById(appId);
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }
    
    // Ensure only the applicant can withdraw
    if (application.applicant.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to withdraw this application.', 403));
    }

    await Application.findByIdAndDelete(appId);

    res.status(200).json({
      status: 'success',
      message: 'Application withdrawn successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const userSkills = req.user.skills || [];
    const userTech = req.user.techStack || [];
    const allQuerySkills = [...new Set([...userSkills, ...userTech])];

    let projects = [];
    if (allQuerySkills.length > 0) {
      projects = await Project.find({
        owner: { $ne: req.user._id },
        $or: [
          { skillsRequired: { $in: allQuerySkills } },
          { skills: { $in: allQuerySkills } }
        ]
      }).populate('owner', 'name avatar').limit(5);
    }

    if (projects.length === 0) {
      projects = await Project.find({ owner: { $ne: req.user._id } }).populate('owner', 'name avatar').limit(5);
    }

    res.status(200).json({
      status: 'success',
      data: { projects }
    });
  } catch (err) {
    next(err);
  }
};

const submitProjectCompletion = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not own this project.', 403));
    }

    if (!project.mentorId) {
      return next(new AppError('You cannot submit for completion without an assigned project mentor.', 400));
    }

    project.status = 'Pending Completion';
    await project.save();

    const io = req.app.get('io');
    await emitEvent(io, 'PROJECT_COMPLETION_SUBMITTED', {
      projectId: project._id,
      actorId: req.user._id,
      recipientId: project.mentorId,
      targetId: project._id,
      targetType: 'Project',
      title: 'Project Completion Requested 🏁',
      message: `The project "${project.title}" has been submitted for completion review.`,
      link: `/mentor/projects`,
      actionText: `submitted project "${project.title}" for completion`
    });

    res.status(200).json({
      status: 'success',
      message: 'Project submitted for mentor completion review successfully.',
      data: { project }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  applyToProject,
  getProjectApplications,
  updateApplicationStatus,
  inviteDeveloper,
  withdrawApplication,
  getRecommendations,
  submitProjectCompletion,
};
