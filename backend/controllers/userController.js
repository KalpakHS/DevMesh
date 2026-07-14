const fs = require('fs');
const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');
const RepEvent = require('../models/RepEvent');
const AppError = require('../utils/appError');
const { cloudinary, useCloudinary } = require('../config/cloudinary');

// Recruiter Sourcing & Tracking Models
const ProfileView = require('../models/ProfileView');
const ResumeDownload = require('../models/ResumeDownload');
const RecruiterBookmark = require('../models/RecruiterBookmark');
const Shortlist = require('../models/Shortlist');
const Interview = require('../models/Interview');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const RecruitmentInvitation = require('../models/RecruitmentInvitation');
const Offer = require('../models/Offer');
const { emitEvent } = require('../services/eventService');

const uploadToStorage = async (file) => {
  if (!file) return '';
  if (useCloudinary) {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'devmesh',
    });
    fs.unlinkSync(file.path); // remove temp local file
    return result.secure_url;
  }
  // Fallback: return static local url mapping to served folder
  return `/uploads/${file.filename}`;
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('badges')
      .select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    const repHistory = await RepEvent.find({ userId: req.params.id })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { 
        user,
        repHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, experience, education, socialLinks, college, availabilityStatus, techStack } = req.body;

    // Filter fields to avoid arbitrary model pollution
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (college !== undefined) updateData.college = college;
    if (availabilityStatus !== undefined) updateData.availabilityStatus = availabilityStatus;
    if (skills) updateData.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    if (techStack) updateData.techStack = Array.isArray(techStack) ? techStack : JSON.parse(techStack);
    if (experience) updateData.experience = Array.isArray(experience) ? experience : JSON.parse(experience);
    if (education) updateData.education = Array.isArray(education) ? education : JSON.parse(education);
    if (socialLinks) updateData.socialLinks = typeof socialLinks === 'object' ? socialLinks : JSON.parse(socialLinks);

    // If an avatar image is uploaded
    if (req.file) {
      updateData.avatar = await uploadToStorage(req.file);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).populate('badges');

    // Broadcast user availability change over socket
    if (availabilityStatus && req.app.get('io')) {
      req.app.get('io').emit('user_status_changed', {
        userId: req.user._id,
        status: availabilityStatus
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a resume file', 400));
    }

    const resumeUrl = await uploadToStorage(req.file);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Resume uploaded successfully',
      data: { resumeUrl: user.resumeUrl },
    });
  } catch (error) {
    next(error);
  }
};

const getPortfolio = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Portfolio includes projects created or collaborated on
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'team.members.user': userId }],
    }).populate('owner', 'name avatar');

    res.status(200).json({
      status: 'success',
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    // Get top users sorted by reputation
    const users = await User.find()
      .select('name avatar bio reputation role badges')
      .populate('badges')
      .sort({ reputation: -1 })
      .limit(20);

    res.status(200).json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

const searchDevelopers = async (req, res, next) => {
  try {
    const { skills, name, college, availabilityStatus } = req.query;
    const query = { role: { $in: ['User', 'developer'] } };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }
    if (availabilityStatus) {
      query.availabilityStatus = availabilityStatus;
    }
    if (skills) {
      const skillsArray = skills.split(',').map((s) => new RegExp(s.trim(), 'i'));
      query.skills = { $in: skillsArray };
    }

    const developers = await User.find(query)
      .select('name email avatar bio skills experience education reputation badges availabilityStatus college techStack')
      .populate('badges')
      .sort({ reputation: -1 });

    res.status(200).json({
      status: 'success',
      data: { developers },
    });
  } catch (error) {
    next(error);
  }
};

const sendInterviewInvitation = async (req, res, next) => {
  try {
    const { developerId, message, date, role } = req.body;
    const recruiterName = req.user.name;

    const Notification = require('../models/Notification');
    const newNotification = await Notification.create({
      recipient: developerId,
      sender: req.user._id,
      type: 'Invitation',
      title: 'Interview Invitation',
      message: `${recruiterName} has invited you to interview for the role of ${role} on ${new Date(date).toLocaleDateString()}. Details: ${message}`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Interview invitation sent successfully!',
      data: { notification: newNotification },
    });
  } catch (error) {
    next(error);
  }
};

const toggleBookmark = async (req, res, next) => {
  try {
    const { developerId } = req.body;
    const recruiterId = req.user._id;

    const Bookmark = require('../models/Bookmark');
    const existing = await Bookmark.findOne({ recruiterId, developerId });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({ status: 'success', isBookmarked: false, message: 'Bookmark removed.' });
    } else {
      await Bookmark.create({ recruiterId, developerId });
      return res.status(200).json({ status: 'success', isBookmarked: true, message: 'Bookmark added.' });
    }
  } catch (error) {
    next(error);
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;
    const Bookmark = require('../models/Bookmark');
    const bookmarks = await Bookmark.find({ recruiterId }).populate('developerId', 'name email avatar bio skills experience reputation badges availabilityStatus college techStack');
    res.status(200).json({
      status: 'success',
      data: { bookmarks: bookmarks.filter(b => b.developerId).map(b => b.developerId) }
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('project', 'title description category deadline status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { applications }
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const Application = require('../models/Application');
    const Bookmark = require('../models/Bookmark');

    await User.findByIdAndDelete(userId);
    await Application.deleteMany({ applicant: userId });
    await Bookmark.deleteMany({ recruiterId: userId });

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NEW DEEP SOURCING DEVELOPER CONTROLLERS
// ==========================================

const getRecruitmentActivity = async (req, res, next) => {
  try {
    const developerId = req.user._id;

    // Profile Views counts (Today, Week, Month)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const viewsToday = await ProfileView.countDocuments({ developerId, createdAt: { $gte: todayStart } });
    const viewsWeek = await ProfileView.countDocuments({ developerId, createdAt: { $gte: weekStart } });
    const viewsMonth = await ProfileView.countDocuments({ developerId, createdAt: { $gte: monthStart } });

    // Bookmarked recruiters list
    const bookmarks = await RecruiterBookmark.find({ developerId })
      .populate('recruiterId', 'name email avatar')
      .sort({ createdAt: -1 });

    const bookmarkedCompanies = await Promise.all(bookmarks.map(async (b) => {
      const p = await RecruiterProfile.findOne({ recruiterId: b.recruiterId._id });
      return {
        recruiter: b.recruiterId,
        company: p ? p.company : 'DevMesh Partner',
        bookmarkedAt: b.createdAt
      };
    }));

    // Shortlists stages
    const shortlists = await Shortlist.find({ developerId })
      .populate('recruiterId', 'name email avatar')
      .sort({ updatedAt: -1 });

    const shortlistedCompanies = await Promise.all(shortlists.map(async (s) => {
      const p = await RecruiterProfile.findOne({ recruiterId: s.recruiterId._id });
      return {
        recruiter: s.recruiterId,
        company: p ? p.company : 'DevMesh Partner',
        stage: s.stage,
        updatedAt: s.updatedAt
      };
    }));

    // Interviews
    const interviews = await Interview.find({ developerId })
      .populate('recruiterId', 'name email avatar')
      .sort({ dateTime: -1 });

    const interviewDetails = await Promise.all(interviews.map(async (iv) => {
      const p = await RecruiterProfile.findOne({ recruiterId: iv.recruiterId._id });
      return {
        _id: iv._id,
        recruiter: iv.recruiterId,
        company: p ? p.company : 'DevMesh Partner',
        title: iv.title,
        description: iv.description,
        dateTime: iv.dateTime,
        mode: iv.mode,
        meetLink: iv.meetLink,
        location: iv.location,
        status: iv.status,
        feedback: iv.feedback
      };
    }));

    // Resume Downloads history
    const downloads = await ResumeDownload.find({ developerId })
      .populate('recruiterId', 'name email avatar')
      .sort({ createdAt: -1 });

    const downloadHistory = await Promise.all(downloads.map(async (d) => {
      const p = await RecruiterProfile.findOne({ recruiterId: d.recruiterId._id });
      return {
        recruiter: d.recruiterId,
        company: p ? p.company : 'DevMesh Partner',
        downloadedAt: d.createdAt
      };
    }));

    // Total counts for recruitment activity feed
    const stats = {
      profileViewedCount: viewsMonth,
      bookmarksCount: bookmarkedCompanies.length,
      shortlistedCount: shortlistedCompanies.length,
      interviewsCount: interviewDetails.length,
      offersCount: shortlistedCompanies.filter(s => s.stage === 'Selected').length
    };

    res.status(200).json({
      status: 'success',
      data: {
        views: {
          today: viewsToday,
          week: viewsWeek,
          month: viewsMonth
        },
        bookmarkedCompanies,
        shortlistedCompanies,
        interviews: interviewDetails,
        resumeDownloads: downloadHistory,
        stats
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateRecruitmentSettings = async (req, res, next) => {
  try {
    const { openToRecruiters, hideProfileFromRecruiters, availableForInternships, availableForFullTime, preferredJobRole, preferredLocation } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found.', 404));

    if (openToRecruiters !== undefined) user.openToRecruiters = openToRecruiters;
    if (hideProfileFromRecruiters !== undefined) user.hideProfileFromRecruiters = hideProfileFromRecruiters;
    if (availableForInternships !== undefined) user.availableForInternships = availableForInternships;
    if (availableForFullTime !== undefined) user.availableForFullTime = availableForFullTime;
    if (preferredJobRole !== undefined) user.preferredJobRole = preferredJobRole;
    if (preferredLocation !== undefined) user.preferredLocation = preferredLocation;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Recruitment preferences updated successfully.',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

const respondToInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { status } = req.body; // 'Accepted' or 'Declined'

    if (status !== 'Accepted' && status !== 'Declined') {
      return next(new AppError('Invalid response status. Choose Accepted or Declined.', 400));
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) return next(new AppError('Interview not found.', 404));

    if (interview.developerId.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized access to this interview.', 403));
    }

    interview.status = status;
    await interview.save();

    const io = req.app.get('io');
    // Notify recruiter that developer accepted/declined
    await emitEvent(io, 'INTERVIEW_RESPONDED', {
      actorId: req.user._id,
      recipientId: interview.recruiterId,
      targetId: interview._id,
      targetType: 'Interview',
      title: `Interview Invitation ${status} 📅`,
      message: `Developer ${req.user.name} has ${status.toLowerCase()} the interview session.`,
      link: `/recruiter/interviews`,
      actionText: `${status.toLowerCase()} interview invitation`
    });

    res.status(200).json({
      status: 'success',
      message: `Interview status updated to ${status}.`,
      data: { interview }
    });
  } catch (err) {
    next(err);
  }
};

const getRecruiterProfileForDev = async (req, res, next) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await User.findById(recruiterId).select('name email avatar role');
    if (!recruiter) return next(new AppError('Recruiter not found.', 404));

    let profile = await RecruiterProfile.findOne({ recruiterId });
    if (!profile) {
      profile = {
        company: 'DevMesh Partner',
        designation: 'Talent Scout',
        about: 'DevMesh tech partner organization.'
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        recruiter,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// NEW BIDIRECTIONAL DEVELOPER CONTROLLERS
// ==========================================

const getJobsMarketplace = async (req, res, next) => {
  try {
    const { search, company, skills, salary, jobType, workMode } = req.query;
    const query = { status: 'Active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => new RegExp(s.trim(), 'i'));
      query.skillsRequired = { $in: skillsArray };
    }

    if (salary) {
      query.salary = { $regex: salary, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (workMode) {
      query.workMode = workMode;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: { jobs }
    });
  } catch (error) {
    next(error);
  }
};

const getSingleJobForDev = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate('recruiterId', 'name email avatar');
    if (!job) return next(new AppError('Job not found.', 404));

    res.status(200).json({
      status: 'success',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.savedJobs.indexOf(jobId);
    if (index > -1) {
      user.savedJobs.splice(index, 1);
      await user.save();
      res.status(200).json({
        status: 'success',
        message: 'Job unsaved successfully.',
        isSaved: false
      });
    } else {
      user.savedJobs.push(jobId);
      await user.save();
      res.status(200).json({
        status: 'success',
        message: 'Job saved successfully.',
        isSaved: true
      });
    }
  } catch (error) {
    next(error);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      model: 'Job'
    });
    res.status(200).json({
      status: 'success',
      data: { jobs: user.savedJobs || [] }
    });
  } catch (error) {
    next(error);
  }
};

const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resume, github, linkedin, hackerrank, portfolio, availability } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return next(new AppError('Job not found.', 404));

    const existingApp = await JobApplication.findOne({ jobId, developerId: req.user._id });
    if (existingApp) return next(new AppError('You have already applied to this job.', 400));

    const application = await JobApplication.create({
      jobId,
      developerId: req.user._id,
      resume: resume || req.user.resumeUrl,
      github: github || req.user.socialLinks?.github,
      linkedin: linkedin || req.user.socialLinks?.linkedin,
      hackerrank: hackerrank || req.user.hackerrank,
      coverLetter,
      portfolio: portfolio || req.user.socialLinks?.website,
      availability,
      status: 'Applied'
    });

    const io = req.app.get('io');
    await emitEvent(io, 'NEW_JOB_APPLICATION', {
      actorId: req.user._id,
      recipientId: job.recruiterId,
      targetId: application._id,
      targetType: 'JobApplication',
      title: 'New Application Received 📄',
      message: `${req.user.name} applied for your job opening: ${job.title}.`,
      link: `/recruiter/applications`,
      actionText: `applied to job: "${job.title}"`
    });

    res.status(201).json({
      status: 'success',
      data: { application }
    });
  } catch (error) {
    next(error);
  }
};

const getDeveloperApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ developerId: req.user._id })
      .populate('jobId', 'title company companyLogo salary workMode jobType location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { applications }
    });
  } catch (error) {
    next(error);
  }
};

const getDeveloperInvitations = async (req, res, next) => {
  try {
    const invitations = await RecruitmentInvitation.find({ developerId: req.user._id })
      .populate('recruiterId', 'name email avatar')
      .populate('jobId', 'title location workMode jobType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { invitations }
    });
  } catch (error) {
    next(error);
  }
};

const respondToInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.body;

    const invitation = await RecruitmentInvitation.findById(invitationId);
    if (!invitation) return next(new AppError('Invitation not found.', 404));

    if (invitation.developerId.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized update.', 403));
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'Accepted' && invitation.jobId) {
      const existingApp = await JobApplication.findOne({ jobId: invitation.jobId, developerId: req.user._id });
      if (!existingApp) {
        await JobApplication.create({
          jobId: invitation.jobId,
          developerId: req.user._id,
          resume: req.user.resumeUrl || '',
          github: req.user.socialLinks?.github || '',
          linkedin: req.user.socialLinks?.linkedin || '',
          hackerrank: req.user.hackerrank || '',
          coverLetter: 'Accepted direct recruiter invitation.',
          portfolio: req.user.socialLinks?.website || '',
          availability: 'Immediate',
          status: 'Applied'
        });
      }
    }

    const io = req.app.get('io');
    await emitEvent(io, 'INVITATION_STATUS_UPDATED', {
      actorId: req.user._id,
      recipientId: invitation.recruiterId,
      targetId: invitation._id,
      targetType: 'RecruitmentInvitation',
      title: `Invitation ${status} ✉️`,
      message: `Developer ${req.user.name} has ${status.toLowerCase()} your invitation for the ${invitation.position} role.`,
      link: `/recruiter/invitations`,
      actionText: `${status.toLowerCase()} hiring invitation for ${invitation.position}`
    });

    res.status(200).json({
      status: 'success',
      data: { invitation }
    });
  } catch (error) {
    next(error);
  }
};

const getDeveloperOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ developerId: req.user._id })
      .populate('recruiterId', 'name email avatar')
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

const respondToOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { status, questions } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) return next(new AppError('Offer not found.', 404));

    if (offer.developerId.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized update.', 403));
    }

    offer.status = status;
    if (questions) {
      offer.questions = questions;
    }
    await offer.save();

    const io = req.app.get('io');
    await emitEvent(io, 'OFFER_STATUS_UPDATED', {
      actorId: req.user._id,
      recipientId: offer.recruiterId,
      targetId: offer._id,
      targetType: 'Offer',
      title: `Offer ${status} 🏆`,
      message: `Developer ${req.user.name} has updated the offer status to ${status}.`,
      link: `/recruiter/offers`,
      actionText: `updated offer status to ${status}`
    });

    res.status(200).json({
      status: 'success',
      data: { offer }
    });
  } catch (error) {
    next(error);
  }
};

const followCompany = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const profile = await RecruiterProfile.findById(profileId);
    if (!profile) return next(new AppError('Company profile not found.', 404));

    const index = profile.followers.indexOf(req.user._id);
    let followed = false;
    if (index > -1) {
      profile.followers.splice(index, 1);
      await profile.save();
    } else {
      profile.followers.push(req.user._id);
      await profile.save();
      followed = true;
    }

    res.status(200).json({
      status: 'success',
      message: followed ? 'Followed company.' : 'Unfollowed company.',
      followed
    });
  } catch (error) {
    next(error);
  }
};

const getFollowedCompanies = async (req, res, next) => {
  try {
    const followed = await RecruiterProfile.find({ followers: req.user._id })
      .populate('recruiterId', 'name email avatar');

    res.status(200).json({
      status: 'success',
      data: { companies: followed }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  getPortfolio,
  getLeaderboard,
  searchDevelopers,
  sendInterviewInvitation,
  toggleBookmark,
  getBookmarks,
  getMyApplications,
  deleteAccount,
  getRecruitmentActivity,
  updateRecruitmentSettings,
  respondToInterview,
  getRecruiterProfileForDev,
  getJobsMarketplace,
  getSingleJobForDev,
  toggleSaveJob,
  getSavedJobs,
  applyToJob,
  getDeveloperApplications,
  getDeveloperInvitations,
  respondToInvitation,
  getDeveloperOffers,
  respondToOffer,
  followCompany,
  getFollowedCompanies,
};
