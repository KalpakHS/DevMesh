const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A project must have a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A project must have a description'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project must have an owner'],
    },
    category: {
      type: String,
      default: 'Web Development',
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'Draft', 'Archived', 'Hiring Closed', 'Pending Completion'],
      default: 'Planning',
    },
    deadline: {
      type: Date,
    },
    rolesNeeded: [
      {
        roleName: {
          type: String,
          required: true,
        },
        skillsRequired: {
          type: [String],
          default: [],
        },
        status: {
          type: String,
          enum: ['Open', 'Filled'],
          default: 'Open',
        },
      },
    ],
    skills: {
      type: [String],
      default: [],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    numOpenings: {
      type: Number,
      default: 1,
    },
    experienceLevel: {
      type: String,
      default: 'Intermediate',
    },
    duration: {
      type: String,
      default: '1 Month',
    },
    visibility: {
      type: String,
      enum: ['public', 'invite-only'],
      default: 'public',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid'],
      default: 'remote',
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['owner', 'leader', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    repoUrl: {
      type: String,
      default: '',
    },
    demoUrl: {
      type: String,
      default: '',
    },
    meetingUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
