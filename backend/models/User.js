const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email!'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['User', 'Mentor', 'Recruiter', 'Admin'],
      default: 'User',
    },
    avatar: {
      type: String,
      default: '',
    },
    college: {
      type: String,
      default: '',
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    techStack: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        graduateYear: Number,
      },
    ],
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    designation: {
      type: String,
      default: '',
    },
    organization: {
      type: String,
      default: '',
    },
    qualification: {
      type: String,
      default: '',
    },
    specialization: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      default: '',
    },
    office: {
      type: String,
      default: '',
    },
    reputation: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Recruiter and Sourcing Settings
    openToRecruiters: {
      type: Boolean,
      default: true,
    },
    hideProfileFromRecruiters: {
      type: Boolean,
      default: false,
    },
    availableForInternships: {
      type: Boolean,
      default: false,
    },
    availableForFullTime: {
      type: Boolean,
      default: false,
    },
    preferredJobRole: {
      type: String,
      default: '',
    },
    preferredLocation: {
      type: String,
      default: '',
    },
    hiringStatus: {
      type: String,
      enum: ['Available for Hiring', 'Not Looking', 'Actively Looking'],
      default: 'Available for Hiring',
    },
    preferredRoles: {
      type: [String],
      default: [],
    },
    preferredLocations: {
      type: [String],
      default: [],
    },
    expectedSalary: {
      type: String,
      default: '',
    },
    noticePeriod: {
      type: String,
      default: '',
    },
    hackerrank: {
      type: String,
      default: '',
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
