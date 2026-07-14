const User = require('../models/User');
const Project = require('../models/Project');
const RecruiterProfile = require('../models/RecruiterProfile');
const RecruiterBookmark = require('../models/RecruiterBookmark');
const Shortlist = require('../models/Shortlist');
const Interview = require('../models/Interview');
const RecruiterMessage = require('../models/RecruiterMessage');
const RecruiterNote = require('../models/RecruiterNote');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const MentorReview = require('../models/MentorReview');
const ProfileView = require('../models/ProfileView');
const ResumeDownload = require('../models/ResumeDownload');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const RecruitmentInvitation = require('../models/RecruitmentInvitation');
const Offer = require('../models/Offer');
const AppError = require('../utils/appError');
const { emitEvent } = require('../services/eventService');

// Role Permission Check Helper
const checkIsRecruiter = (req, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role !== 'recruiter' && role !== 'admin') {
    return next(new AppError('Access denied. Recruiter role required.', 403));
  }
};

// 1. Recruiter Dashboard Analytics
const getRecruiterDashboard = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const recruiterId = req.user._id;

    // KPI Metrics
    const totalDevelopers = await User.countDocuments({ role: 'User' });
    const savedCandidates = await RecruiterBookmark.countDocuments({ recruiterId });
    const shortlistedCandidates = await Shortlist.countDocuments({ recruiterId });
    const interviewsScheduled = await Interview.countDocuments({ recruiterId, status: 'Scheduled' });

    // Active conversations count
    const uniqueChats = await RecruiterMessage.distinct('recipientId', { senderId: recruiterId });
    const activeConversations = uniqueChats.length;

    // Top Developers list
    const topDevelopers = await User.find({ role: 'User' })
      .sort({ reputation: -1 })
      .limit(6);

    // Recently joined developers
    const recentDevelopers = await User.find({ role: 'User' })
      .sort({ createdAt: -1 })
      .limit(6);

    // Interviews this week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const upcomingInterviews = await Interview.find({
      recruiterId,
      dateTime: { $gte: startOfWeek, $lte: endOfWeek }
    })
      .populate('developerId', 'name avatar skills')
      .sort({ dateTime: 1 });

    console.log(`[Diagnostic] getRecruiterDashboard totalDevelopers: ${totalDevelopers} topDevelopers: ${topDevelopers.length} recentDevelopers: ${recentDevelopers.length}`);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalDevelopers,
          savedCandidates,
          shortlistedCandidates,
          interviewsScheduled,
          activeConversations
        },
        topDevelopers,
        recentDevelopers,
        upcomingInterviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Discover / Search Developers
const searchDevelopers = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);

    const { search, skills, college, availability, minRep, maxRep, sortBy } = req.query;

    const query = { role: 'User' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => new RegExp(s.trim(), 'i'));
      query.skills = { $in: skillsArray };
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (availability) {
      query.availabilityStatus = availability; // e.g. 'Available', 'Busy'
    }

    if (minRep || maxRep) {
      query.reputation = {};
      if (minRep) query.reputation.$gte = parseInt(minRep);
      if (maxRep) query.reputation.$lte = parseInt(maxRep);
    }

    let sortOptions = { reputation: -1 }; // default
    if (sortBy === 'newest') sortOptions = { createdAt: -1 };
    if (sortBy === 'alphabetical') sortOptions = { name: 1 };

    const developers = await User.find(query)
      .sort(sortOptions)
      .select('name email avatar bio skills reputation availabilityStatus college socialLinks');

    console.log(`[Diagnostic] searchDevelopers query: ${JSON.stringify(query)} returned count: ${developers.length}`);

    res.status(200).json({
      status: 'success',
      data: { developers }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Candidate Profile Details (Fully populated with Projects, Commits, Ratings, Notes, Badges)
const getDeveloperProfile = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { developerId } = req.params;

    const developer = await User.findById(developerId)
      .populate('badges');
    if (!developer) return next(new AppError('Candidate not found.', 404));

    // Log ProfileView record
    const rProf = await RecruiterProfile.findOne({ recruiterId: req.user._id });
    const companyName = rProf ? rProf.company : 'DevMesh Recruiter';
    
    await ProfileView.create({
      developerId,
      recruiterId: req.user._id,
      companyName
    });

    const io = req.app.get('io');
    // Notify candidate
    await emitEvent(io, 'RECRUITER_VIEWED_PROFILE', {
      actorId: req.user._id,
      recipientId: developerId,
      targetId: req.user._id,
      targetType: 'User',
      title: 'Profile Viewed 👀',
      message: `A recruiter from ${companyName} viewed your profile.`,
      link: `/profile`,
      actionText: `viewed profile of "${developer.name}"`
    });

    // Retrieve completed projects
    const completedProjects = await Project.find({
      $or: [{ owner: developerId }, { 'members.userId': developerId }],
      status: 'Completed'
    });

    const activeProjects = await Project.find({
      $or: [{ owner: developerId }, { 'members.userId': developerId }],
      status: { $ne: 'Completed' }
    });

    const allProjectIds = [...completedProjects, ...activeProjects].map(p => p._id);

    // Retrieve mentor reviews inside those projects
    const mentorReviews = await MentorReview.find({ projectId: { $in: allProjectIds } })
      .populate('mentorId', 'name avatar');

    // Retrieve candidate activity logs
    const activityTimeline = await ActivityLog.find({ actorId: developerId })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Retrieve private recruiter candidate notes
    const privateNotes = await RecruiterNote.find({
      recruiterId: req.user._id,
      developerId
    }).sort({ createdAt: -1 });

    // Log Profile Viewed activity
    await ActivityLog.create({
      actorId: req.user._id,
      action: `Viewed profile of candidate "${developer.name}"`
    });

    res.status(200).json({
      status: 'success',
      data: {
        developer,
        completedProjects,
        activeProjects,
        mentorReviews,
        activityTimeline,
        privateNotes
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Bookmark Actions
const toggleBookmarkCandidate = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { developerId } = req.params;

    const developer = await User.findById(developerId);
    if (!developer) return next(new AppError('Candidate not found.', 404));

    const existing = await RecruiterBookmark.findOne({
      recruiterId: req.user._id,
      developerId
    });

    const io = req.app.get('io');

    if (existing) {
      await RecruiterBookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        status: 'success',
        message: 'Candidate bookmark removed.'
      });
    }

    const bookmark = await RecruiterBookmark.create({
      recruiterId: req.user._id,
      developerId
    });

    // Notify Candidate
    await emitEvent(io, 'RECRUITER_BOOKMARKED_CANDIDATE', {
      actorId: req.user._id,
      recipientId: developerId,
      targetId: bookmark._id,
      targetType: 'RecruiterBookmark',
      title: 'Profile Bookmarked! ⭐',
      message: `A recruiter has bookmarked your developer profile.`,
      link: `/profile/${developerId}`,
      actionText: `bookmarked profile of "${developer.name}"`
    });

    // Log activity
    await ActivityLog.create({
      actorId: req.user._id,
      action: `Bookmarked candidate profile "${developer.name}"`
    });

    res.status(201).json({
      status: 'success',
      data: { bookmark }
    });
  } catch (error) {
    next(error);
  }
};

const getBookmarkedCandidates = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);

    const bookmarks = await RecruiterBookmark.find({ recruiterId: req.user._id })
      .populate('developerId', 'name email avatar skills reputation availabilityStatus college');

    const developers = bookmarks.map(b => b.developerId).filter(d => d !== null);

    res.status(200).json({
      status: 'success',
      data: { developers }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Shortlists management
const getShortlistedCandidates = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);

    const shortlists = await Shortlist.find({ recruiterId: req.user._id })
      .populate('developerId', 'name email avatar skills reputation college availabilityStatus');

    res.status(200).json({
      status: 'success',
      data: { shortlists }
    });
  } catch (error) {
    next(error);
  }
};

const toggleShortlistCandidate = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { developerId } = req.params;
    const { stage, notes } = req.body;

    const developer = await User.findById(developerId);
    if (!developer) return next(new AppError('Candidate not found.', 404));

    const existing = await Shortlist.findOne({
      recruiterId: req.user._id,
      developerId
    });

    const io = req.app.get('io');

    if (existing) {
      if (stage === 'remove') {
        await Shortlist.findByIdAndDelete(existing._id);
        return res.status(200).json({
          status: 'success',
          message: 'Candidate removed from shortlist.'
        });
      }

      existing.stage = stage || existing.stage;
      existing.notes = notes !== undefined ? notes : existing.notes;
      await existing.save();

      return res.status(200).json({
        status: 'success',
        data: { shortlist: existing }
      });
    }

    const shortlist = await Shortlist.create({
      recruiterId: req.user._id,
      developerId,
      stage: stage || 'Shortlisted',
      notes: notes || ''
    });

    // Notify Candidate
    await emitEvent(io, 'RECRUITER_SHORTLISTED_CANDIDATE', {
      actorId: req.user._id,
      recipientId: developerId,
      targetId: shortlist._id,
      targetType: 'Shortlist',
      title: 'Shortlisted for role! 💼',
      message: `A recruiter has added you to their candidate shortlist.`,
      link: `/profile/${developerId}`,
      actionText: `shortlisted candidate "${developer.name}"`
    });

    // Log to Activity Log
    await ActivityLog.create({
      actorId: req.user._id,
      action: `Shortlisted candidate "${developer.name}"`
    });

    res.status(201).json({
      status: 'success',
      data: { shortlist }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Interview Management
const getRecruiterInterviews = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);

    const interviews = await Interview.find({ recruiterId: req.user._id })
      .populate('developerId', 'name email avatar skills college')
      .sort({ dateTime: -1 });

    res.status(200).json({
      status: 'success',
      data: { interviews }
    });
  } catch (error) {
    next(error);
  }
};

const scheduleInterview = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);

    const { developerId, title, description, dateTime, timezone, mode, meetLink, location } = req.body;

    const developer = await User.findById(developerId);
    if (!developer) return next(new AppError('Candidate not found.', 404));

    const interview = await Interview.create({
      recruiterId: req.user._id,
      developerId,
      title,
      description: description || '',
      dateTime,
      timezone: timezone || 'UTC',
      mode: mode || 'Online',
      meetLink: meetLink || '',
      location: location || '',
      status: 'Scheduled'
    });

    const io = req.app.get('io');

    // Notify candidate
    await emitEvent(io, 'INTERVIEW_SCHEDULED', {
      actorId: req.user._id,
      recipientId: developerId,
      targetId: interview._id,
      targetType: 'Interview',
      title: 'Interview Scheduled 📅',
      message: `Recruiter scheduled interview: "${title}" for ${new Date(dateTime).toLocaleString()}`,
      link: `/interviews`,
      actionText: `scheduled interview "${title}" with "${developer.name}"`
    });

    // Log activity
    await ActivityLog.create({
      actorId: req.user._id,
      action: `Scheduled interview "${title}" with candidate "${developer.name}"`
    });

    res.status(201).json({
      status: 'success',
      data: { interview }
    });
  } catch (error) {
    next(error);
  }
};

const updateInterviewDetails = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { interviewId } = req.params;
    const { title, description, dateTime, timezone, mode, meetLink, location, status, notes, feedback } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return next(new AppError('Interview log not found.', 404));

    if (title !== undefined) interview.title = title;
    if (description !== undefined) interview.description = description;
    if (dateTime !== undefined) interview.dateTime = dateTime;
    if (timezone !== undefined) interview.timezone = timezone;
    if (mode !== undefined) interview.mode = mode;
    if (meetLink !== undefined) interview.meetLink = meetLink;
    if (location !== undefined) interview.location = location;
    if (status !== undefined) interview.status = status;
    if (notes !== undefined) interview.notes = notes;
    if (feedback !== undefined) interview.feedback = feedback;

    await interview.save();

    const developer = await User.findById(interview.developerId);
    const io = req.app.get('io');

    if (developer) {
      const eventType = status === 'Cancelled' ? 'INTERVIEW_CANCELLED' : 'INTERVIEW_UPDATED';
      const eventTitle = status === 'Cancelled' ? 'Interview Cancelled ❌' : 'Interview Details Updated 📅';
      const eventMsg = status === 'Cancelled'
        ? `Interview "${interview.title}" has been cancelled.`
        : `Interview "${interview.title}" details have been updated.`;

      await emitEvent(io, eventType, {
        actorId: req.user._id,
        recipientId: developer._id,
        targetId: interview._id,
        targetType: 'Interview',
        title: eventTitle,
        message: eventMsg,
        link: `/interviews`,
        actionText: `updated interview "${interview.title}" with "${developer.name}"`
      });

      // Log activity
      await ActivityLog.create({
        actorId: req.user._id,
        action: `Updated interview status of "${interview.title}" to ${status}`
      });
    }

    res.status(200).json({
      status: 'success',
      data: { interview }
    });
  } catch (error) {
    next(error);
  }
};

// 7. Messaging actions
const sendRecruiterMessage = async (req, res, next) => {
  try {
    const { recipientId, content, attachments } = req.body;

    const message = await RecruiterMessage.create({
      senderId: req.user._id,
      recipientId,
      content,
      attachments: attachments || []
    });

    const io = req.app.get('io');

    // Emit real-time message received event
    io.to(recipientId.toString()).emit('recruiter_message_received', {
      message,
      sender: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
      }
    });

    // Notify candidate
    await emitEvent(io, 'RECRUITER_MESSAGE_SENT', {
      actorId: req.user._id,
      recipientId,
      targetId: message._id,
      targetType: 'RecruiterMessage',
      title: 'New Message Received 💬',
      message: `${req.user.name}: "${content.substring(0, 30)}..."`,
      link: `/messages`,
      actionText: `sent message to candidate`
    });

    // Log Activity log
    await ActivityLog.create({
      actorId: req.user._id,
      action: `Sent private message to user`
    });

    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

const getRecruiterMessages = async (req, res, next) => {
  try {
    const { partnerId } = req.params;

    const messages = await RecruiterMessage.find({
      $or: [
        { senderId: req.user._id, recipientId: partnerId },
        { senderId: partnerId, recipientId: req.user._id }
      ]
    })
      .sort({ createdAt: 1 });

    // Mark messages as read
    await RecruiterMessage.updateMany(
      { senderId: partnerId, recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

const getRecruiterConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate conversation partners
    const partners = await RecruiterMessage.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$recipientId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$content' },
          lastTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipientId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate profile details
    const conversations = await Promise.all(partners.map(async (p) => {
      const u = await User.findById(p._id).select('name avatar bio skills reputation availabilityStatus role');
      const rp = await RecruiterProfile.findOne({ recruiterId: p._id });
      return {
        partner: u,
        company: rp ? rp.company : 'DevMesh Partner',
        lastMessage: p.lastMessage,
        lastTime: p.lastTime,
        unreadCount: p.unreadCount
      };
    }));

    res.status(200).json({
      status: 'success',
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

// 8. Recruiter Profile Management
const getRecruiterProfile = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);

    let profile = await RecruiterProfile.findOne({ recruiterId: req.user._id });
    if (!profile) {
      profile = await RecruiterProfile.create({
        recruiterId: req.user._id,
        company: 'DevMesh Partner',
        designation: 'HR Coordinator'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

const updateRecruiterProfile = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { company, designation, industry, location, about, website, linkedIn, companyLogo, openPositions, experienceRequired } = req.body;

    let profile = await RecruiterProfile.findOne({ recruiterId: req.user._id });
    if (!profile) {
      profile = new RecruiterProfile({ recruiterId: req.user._id });
    }

    if (company !== undefined) profile.company = company;
    if (designation !== undefined) profile.designation = designation;
    if (industry !== undefined) profile.industry = industry;
    if (location !== undefined) profile.location = location;
    if (about !== undefined) profile.about = about;
    if (website !== undefined) profile.website = website;
    if (linkedIn !== undefined) profile.linkedIn = linkedIn;
    if (companyLogo !== undefined) profile.companyLogo = companyLogo;
    if (openPositions !== undefined) profile.openPositions = openPositions;
    if (experienceRequired !== undefined) profile.experienceRequired = experienceRequired;

    await profile.save();

    // Log Activity log
    await ActivityLog.create({
      actorId: req.user._id,
      action: 'Updated recruitment profile parameters'
    });

    res.status(200).json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// 9. Private Candidate Notes Controllers
const getDeveloperNotes = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { developerId } = req.params;

    const notes = await RecruiterNote.find({
      recruiterId: req.user._id,
      developerId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { notes }
    });
  } catch (error) {
    next(error);
  }
};

const addDeveloperNote = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { developerId } = req.params;
    const { content } = req.body;

    const note = await RecruiterNote.create({
      recruiterId: req.user._id,
      developerId,
      content
    });

    // Log activity
    await ActivityLog.create({
      actorId: req.user._id,
      action: 'Added private candidate note evaluation'
    });

    res.status(201).json({
      status: 'success',
      data: { note }
    });
  } catch (error) {
    next(error);
  }
};

const deleteDeveloperNote = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { noteId } = req.params;

    const note = await RecruiterNote.findById(noteId);
    if (!note) return next(new AppError('Note not found.', 404));

    if (note.recruiterId.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to delete this note.', 403));
    }

    await RecruiterNote.findByIdAndDelete(noteId);

    res.status(200).json({
      status: 'success',
      message: 'Note deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const trackResumeDownload = async (req, res, next) => {
  try {
    checkIsRecruiter(req, next);
    const { developerId } = req.params;

    const developer = await User.findById(developerId);
    if (!developer) return next(new AppError('Candidate not found.', 404));

    // Log ResumeDownload record
    const rProf = await RecruiterProfile.findOne({ recruiterId: req.user._id });
    const companyName = rProf ? rProf.company : 'DevMesh Recruiter';

    await ResumeDownload.create({
      developerId,
      recruiterId: req.user._id,
      companyName
    });

    const io = req.app.get('io');
    // Notify candidate
    await emitEvent(io, 'RECRUITER_DOWNLOADED_RESUME', {
      actorId: req.user._id,
      recipientId: developerId,
      targetId: req.user._id,
      targetType: 'User',
      title: 'Resume Downloaded 📄',
      message: `A recruiter from ${companyName} downloaded your resume.`,
      link: `/profile`,
      actionText: `downloaded resume of "${developer.name}"`
    });

    res.status(200).json({
      status: 'success',
      message: 'Resume download tracked.'
    });
  } catch (error) {
    next(error);
  }
};

// 10. Job Management
const createJob = async (req, res, next) => {
  try {
    const { title, company, companyLogo, jobType, workMode, location, salary, experienceRequired, skillsRequired, description, responsibilities, eligibility, deadline, openings } = req.body;
    const job = await Job.create({
      title,
      company,
      companyLogo,
      recruiterId: req.user._id,
      jobType,
      workMode,
      location,
      salary,
      experienceRequired,
      skillsRequired,
      description,
      responsibilities,
      eligibility,
      deadline,
      openings
    });

    const io = req.app.get('io');
    await emitEvent(io, 'NEW_JOB_POSTED', {
      actorId: req.user._id,
      recipientId: null,
      targetId: job._id,
      targetType: 'Job',
      title: 'New Job Opportunity 💼',
      message: `${company} is hiring for ${title}!`,
      link: `/jobs/${job._id}`,
      actionText: `posted a new job: "${title}"`
    });

    res.status(201).json({
      status: 'success',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

const getPostedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: { jobs }
    });
  } catch (error) {
    next(error);
  }
};

const getSingleJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return next(new AppError('Job not found.', 404));

    res.status(200).json({
      status: 'success',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

const updateJobDetails = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return next(new AppError('Job not found.', 404));

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized update.', 403));
    }

    const updated = await Job.findByIdAndUpdate(jobId, req.body, { new: true });
    res.status(200).json({
      status: 'success',
      data: { job: updated }
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return next(new AppError('Job not found.', 404));

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized delete.', 403));
    }

    await Job.findByIdAndDelete(jobId);
    res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const getIncomingJobApplications = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id });
    const jobIds = jobs.map(j => j._id);

    const applications = await JobApplication.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company companyLogo')
      .populate('developerId', 'name email avatar skills reputation college hiringStatus noticePeriod preferredLocation expectedSalary')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { applications }
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await JobApplication.findById(applicationId)
      .populate('jobId', 'title company recruiterId');

    if (!application) return next(new AppError('Application not found.', 404));

    if (application.jobId.recruiterId.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized update.', 403));
    }

    application.status = status;
    await application.save();

    const io = req.app.get('io');
    let eventType = 'APPLICATION_STATUS_UPDATED';
    let notiTitle = 'Application Update 📄';
    let notiMessage = `Your application status for ${application.jobId.title} at ${application.jobId.company} has been updated to ${status}.`;

    if (status === 'Shortlisted') {
      eventType = 'APPLICATION_SHORTLISTED';
      notiTitle = 'Shortlisted! 🎉';
    } else if (status === 'Selected') {
      eventType = 'APPLICATION_ACCEPTED';
      notiTitle = 'Selected! 🏆';
    } else if (status === 'Rejected') {
      eventType = 'APPLICATION_REJECTED';
      notiTitle = 'Application Status 📄';
    }

    await emitEvent(io, eventType, {
      actorId: req.user._id,
      recipientId: application.developerId,
      targetId: application._id,
      targetType: 'JobApplication',
      title: notiTitle,
      message: notiMessage,
      link: `/recruitment`,
      actionText: `updated application status of candidate to ${status}`
    });

    res.status(200).json({
      status: 'success',
      data: { application }
    });
  } catch (error) {
    next(error);
  }
};

const sendDirectInvitation = async (req, res, next) => {
  try {
    const { developerId, jobId, company, position, salary, description, message } = req.body;
    const developer = await User.findById(developerId);
    if (!developer) return next(new AppError('Developer not found.', 404));

    if (developer.hiringStatus === 'Not Looking') {
      return next(new AppError('This developer is currently not open to hiring.', 400));
    }

    const invitation = await RecruitmentInvitation.create({
      recruiterId: req.user._id,
      developerId,
      jobId: jobId || null,
      company,
      position,
      salary,
      description,
      message,
      status: 'Pending'
    });

    const io = req.app.get('io');
    await emitEvent(io, 'INVITATION_RECEIVED', {
      actorId: req.user._id,
      recipientId: developerId,
      targetId: invitation._id,
      targetType: 'RecruitmentInvitation',
      title: 'Recruitment Invitation ✉️',
      message: `You received an invitation from ${company} for the position of ${position}.`,
      link: `/recruitment`,
      actionText: `sent a hiring invitation to "${developer.name}"`
    });

    res.status(201).json({
      status: 'success',
      data: { invitation }
    });
  } catch (error) {
    next(error);
  }
};

const getSentInvitations = async (req, res, next) => {
  try {
    const invitations = await RecruitmentInvitation.find({ recruiterId: req.user._id })
      .populate('developerId', 'name email avatar skills reputation college')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { invitations }
    });
  } catch (error) {
    next(error);
  }
};

const sendOfferLetter = async (req, res, next) => {
  try {
    const { developerId, jobId, company, role, salary, joiningDate, location, offerLetterUrl } = req.body;
    const developer = await User.findById(developerId);
    if (!developer) return next(new AppError('Developer not found.', 404));

    const offer = await Offer.create({
      recruiterId: req.user._id,
      developerId,
      jobId: jobId || null,
      company,
      role,
      salary,
      joiningDate,
      location,
      offerLetterUrl,
      status: 'Sent'
    });

    const io = req.app.get('io');
    await emitEvent(io, 'OFFER_RECEIVED', {
      actorId: req.user._id,
      recipientId: developerId,
      targetId: offer._id,
      targetType: 'Offer',
      title: 'Offer Received! ✉️',
      message: `Congratulations! You received an offer letter from ${company} for the position of ${role}.`,
      link: `/recruitment`,
      actionText: `sent a job offer letter to "${developer.name}"`
    });

    res.status(201).json({
      status: 'success',
      data: { offer }
    });
  } catch (error) {
    next(error);
  }
};

const getSentOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ recruiterId: req.user._id })
      .populate('developerId', 'name email avatar skills college')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { offers }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecruiterDashboard,
  searchDevelopers,
  getDeveloperProfile,
  toggleBookmarkCandidate,
  getBookmarkedCandidates,
  getShortlistedCandidates,
  toggleShortlistCandidate,
  getRecruiterInterviews,
  scheduleInterview,
  updateInterviewDetails,
  sendRecruiterMessage,
  getRecruiterMessages,
  getRecruiterConversations,
  getRecruiterProfile,
  updateRecruiterProfile,
  getDeveloperNotes,
  addDeveloperNote,
  deleteDeveloperNote,
  trackResumeDownload,
  createJob,
  getPostedJobs,
  getSingleJob,
  updateJobDetails,
  deleteJob,
  getIncomingJobApplications,
  updateApplicationStatus,
  sendDirectInvitation,
  getSentInvitations,
  sendOfferLetter,
  getSentOffers,
};
