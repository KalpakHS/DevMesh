const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Badge = require('../models/Badge');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Interview = require('../models/Interview');
const Shortlist = require('../models/Shortlist');
const RecruiterBookmark = require('../models/RecruiterBookmark');
const Offer = require('../models/Offer');
const Task = require('../models/Task');
const WorkspaceFile = require('../models/WorkspaceFile');
const ActivityLog = require('../models/ActivityLog');
const Meeting = require('../models/Meeting');
const RecruiterMessage = require('../models/RecruiterMessage');
const MentorReview = require('../models/MentorReview');

const { seedBadges } = require('./badgeService');

const seedRealData = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@devconnect.local' });
    if (adminExists) {
      console.log('Database already populated with Bengaluru Demo Dataset.');
      return;
    }

    console.log('--- Wiping All Collections for Clean Re-Seed ---');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Badge.deleteMany({});
    await RecruiterProfile.deleteMany({});
    await Job.deleteMany({});
    await JobApplication.deleteMany({});
    await Interview.deleteMany({});
    await Shortlist.deleteMany({});
    await RecruiterBookmark.deleteMany({});
    await Offer.deleteMany({});
    await Task.deleteMany({});
    await WorkspaceFile.deleteMany({});
    await ActivityLog.deleteMany({});
    await Meeting.deleteMany({});
    await RecruiterMessage.deleteMany({});
    await MentorReview.deleteMany({});

    console.log('✔ All collections cleaned successfully.');

    console.log('--- Seeding Gamification Badges ---');
    await seedBadges();
    const badges = await Badge.find({});
    const risingStarBadge = badges.find(b => b.milestone === 'rising_star');
    const codeNinjaBadge = badges.find(b => b.milestone === 'code_ninja');
    const contributionBadge = badges.find(b => b.milestone === 'first_contribution');

    console.log('--- Seeding Admin Account ---');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@devconnect.local',
      password: 'Admin@123',
      role: 'Admin',
      isEmailVerified: true
    });

    console.log('--- Seeding Mentors ---');
    const mentorData = [
      {
        name: 'Dr. Shashidhar Hegde',
        email: 'shashidhar.hegde@sjbit.edu.in',
        password: 'Mentor@123',
        designation: 'Professor, Department of Computer Science & Engineering',
        organization: 'SJB Institute of Technology, Bengaluru',
        qualification: 'Ph.D. in Computer Science',
        specialization: ['Full Stack Development', 'Cloud Computing', 'Software Engineering'],
        experienceYears: 15,
        phone: '+91 9876501001',
        office: 'CSE Department, SJBIT',
        bio: 'Guides final-year engineering projects in Full Stack Development, Cloud Computing, and Software Engineering. Passionate about mentoring students for industry-ready solutions.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
        availabilityStatus: 'available'
      },
      {
        name: 'Prof. Kavitha M',
        email: 'kavitha.m@rvce.edu.in',
        password: 'Mentor@123',
        designation: 'Associate Professor',
        organization: 'RV College of Engineering, Bengaluru',
        qualification: 'M.Tech',
        specialization: ['Artificial Intelligence', 'Machine Learning', 'Data Analytics'],
        experienceYears: 12,
        phone: '+91 9876501002',
        bio: 'Mentors AI, Machine Learning, and Data Analytics projects while helping students prepare for placements and higher studies.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
        availabilityStatus: 'available'
      },
      {
        name: 'Prof. Ramesh Kumar N',
        email: 'ramesh.kumar@bmsce.ac.in',
        password: 'Mentor@123',
        designation: 'Associate Professor',
        organization: 'BMS College of Engineering, Bengaluru',
        qualification: 'M.Tech',
        specialization: ['Internet of Things', 'Embedded Systems', 'Mobile Application Development'],
        experienceYears: 10,
        phone: '+91 9876501003',
        bio: 'Guides IoT and Embedded Systems projects with industry collaboration and innovation-focused mentoring.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
        availabilityStatus: 'available'
      }
    ];

    const mentors = [];
    for (const m of mentorData) {
      const u = await User.create({
        ...m,
        role: 'Mentor',
        isEmailVerified: true
      });
      mentors.push(u);
    }

    console.log('--- Seeding Student Profiles ---');
    const studentData = [
      {
        name: 'Kalpak H S',
        email: 'kalpakshivakumar@gmail.com',
        password: 'Kalpak@123',
        college: 'SJB Institute of Technology, Bengaluru',
        bio: 'Computer Science student passionate about Full Stack Development, Java, IoT, and AI. Interested in building scalable web applications and solving real-world problems.',
        availabilityStatus: 'available',
        skills: ['Java', 'Spring Boot', 'React', 'Node.js', 'MongoDB', 'MySQL', 'Git', 'REST APIs'],
        techStack: ['MERN', 'Java', 'Firebase'],
        socialLinks: {
          github: 'https://github.com/kalpakhs',
          linkedin: 'https://linkedin.com/in/kalpakhs',
          website: 'https://kalpak.dev',
          twitter: 'https://x.com/kalpakhs'
        },
        hackerrank: 'https://hackerrank.com/kalpakhs',
        resumeUrl: '/uploads/resumes/kalpak_resume.pdf',
        openToRecruiters: true,
        hideProfileFromRecruiters: false,
        availableForInternships: true,
        availableForFullTime: true,
        preferredJobRole: 'Full Stack Developer',
        preferredLocation: 'Bengaluru / Remote',
        reputation: 95,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        badges: risingStarBadge ? [risingStarBadge._id] : []
      },
      {
        name: 'Manjunath Gowda',
        email: 'manjunath.gowda@devconnect.local',
        password: 'Manju@123',
        college: 'BMS College of Engineering, Bengaluru',
        bio: 'Frontend developer interested in React, UI/UX and responsive web applications.',
        availabilityStatus: 'available',
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS', 'TypeScript'],
        techStack: ['React', 'Vite', 'Firebase'],
        preferredJobRole: 'Frontend Developer',
        preferredLocation: 'Bengaluru',
        reputation: 82,
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80'
      },
      {
        name: 'Keerthana R',
        email: 'keerthana.r@devconnect.local',
        password: 'Keerthi@123',
        college: 'RV College of Engineering, Bengaluru',
        bio: 'Backend developer passionate about APIs and cloud computing.',
        availabilityStatus: 'available',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'AWS', 'Git'],
        techStack: ['Spring Boot', 'MySQL', 'Docker'],
        preferredJobRole: 'Backend Developer',
        preferredLocation: 'Hybrid Bengaluru',
        reputation: 91,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
        badges: codeNinjaBadge ? [codeNinjaBadge._id] : []
      },
      {
        name: 'Rakshith Kumar',
        email: 'rakshith.kumar@devconnect.local',
        password: 'Rakshith@123',
        college: 'PES University, Bengaluru',
        bio: 'Android and Flutter developer with strong problem-solving skills.',
        availabilityStatus: 'available',
        skills: ['Flutter', 'Dart', 'Firebase', 'Java', 'Kotlin'],
        techStack: ['Flutter', 'Firebase'],
        preferredJobRole: 'Mobile App Developer',
        preferredLocation: 'Remote',
        reputation: 80,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'
      },
      {
        name: 'Shwetha N',
        email: 'shwetha.n@devconnect.local',
        password: 'Shwetha@123',
        college: 'Dayananda Sagar College of Engineering, Bengaluru',
        bio: 'Interested in Data Analytics and Machine Learning.',
        availabilityStatus: 'available',
        skills: ['Python', 'SQL', 'Power BI', 'Pandas', 'Machine Learning'],
        techStack: ['Python', 'Machine Learning'],
        preferredJobRole: 'Data Analyst',
        preferredLocation: 'Bengaluru',
        reputation: 88,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
        badges: contributionBadge ? [contributionBadge._id] : []
      }
    ];

    const students = [];
    for (const s of studentData) {
      const u = await User.create({
        ...s,
        role: 'User',
        isEmailVerified: true
      });
      students.push(u);
    }

    console.log('--- Seeding Recruiter Profiles ---');
    const recruiterData = [
      {
        name: 'Anand Prakash',
        email: 'anand@zensoftech.com',
        password: 'Recruit@123',
        company: 'Zensof Technologies Pvt. Ltd.',
        designation: 'Senior Talent Acquisition Specialist',
        industry: 'Software Development',
        location: 'Electronic City, Bengaluru',
        employees: '500-1000',
        website: 'https://www.zensof.com',
        benefits: 'Health Insurance, Hybrid Work, Learning Budget, Performance Bonus',
        companyLogo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=80&q=80'
      },
      {
        name: 'Pooja Shetty',
        email: 'pooja@razorpay-demo.com',
        password: 'Recruit@123',
        company: 'Razorpay',
        designation: 'Technical Recruiter',
        industry: 'FinTech',
        location: 'Koramangala, Bengaluru',
        employees: '2000+',
        website: 'https://razorpay.com',
        benefits: 'ESOPs, Medical Insurance, Free Meals, Flexible Hours',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80'
      },
      {
        name: 'Naveen Kumar',
        email: 'naveen@happiestminds-demo.com',
        password: 'Recruit@123',
        company: 'Happiest Minds Technologies',
        designation: 'Hiring Manager',
        industry: 'IT Services',
        location: 'Whitefield, Bengaluru',
        employees: '5000+',
        website: 'https://www.happiestminds.com',
        benefits: 'WFH Options, Certification Support, Annual Bonus',
        companyLogo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80'
      }
    ];

    const recruiters = [];
    for (const r of recruiterData) {
      const u = await User.create({
        name: r.name,
        email: r.email,
        password: r.password,
        role: 'Recruiter',
        avatar: r.companyLogo,
        isEmailVerified: true
      });

      const profile = await RecruiterProfile.create({
        recruiterId: u._id,
        company: r.company,
        designation: r.designation,
        industry: r.industry,
        location: r.location,
        employees: r.employees,
        website: r.website,
        benefits: r.benefits,
        companyLogo: r.companyLogo
      });

      recruiters.push({ user: u, profile });
    }

    console.log('--- Seeding Job Postings ---');
    const jobsData = [
      {
        title: 'Frontend Developer Intern',
        company: 'Razorpay',
        jobType: 'Internship',
        workMode: 'Hybrid',
        location: 'Koramangala, Bengaluru',
        salary: '₹35,000/month',
        experienceRequired: 'Fresher',
        skillsRequired: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
        openings: 3,
        status: 'Active',
        deadline: new Date('2026-08-31'),
        description: 'Excellent internship role in our core team working on next-gen merchant checkout features.',
        recruiterEmail: 'pooja@razorpay-demo.com'
      },
      {
        title: 'Java Backend Developer',
        company: 'Happiest Minds Technologies',
        jobType: 'Full Time',
        workMode: 'On-site',
        location: 'Whitefield, Bengaluru',
        salary: '₹6-8 LPA',
        experienceRequired: '0-2 Years',
        skillsRequired: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
        openings: 5,
        status: 'Active',
        deadline: new Date('2026-09-15'),
        description: 'Build backend logic, databases, integration triggers, and enterprise microservices.',
        recruiterEmail: 'naveen@happiestminds-demo.com'
      },
      {
        title: 'Full Stack Developer',
        company: 'Zensof Technologies Pvt. Ltd.',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        location: 'Electronic City, Bengaluru',
        salary: '₹7-9 LPA',
        experienceRequired: 'Fresher',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express', 'Git'],
        openings: 2,
        status: 'Active',
        deadline: new Date('2026-09-10'),
        description: 'Work on end-to-end applications across MERN framework, DevOps deployments, and scaling products.',
        recruiterEmail: 'anand@zensoftech.com'
      },
      {
        title: 'Flutter Developer Intern',
        company: 'Razorpay',
        jobType: 'Internship',
        workMode: 'Remote',
        location: 'Bengaluru',
        salary: '₹30,000/month',
        experienceRequired: 'Fresher',
        skillsRequired: ['Flutter', 'Dart', 'Firebase'],
        openings: 2,
        status: 'Active',
        deadline: new Date('2026-09-05'),
        description: 'Opportunity to learn and code scalable cross-platform mobile apps.',
        recruiterEmail: 'pooja@razorpay-demo.com'
      },
      {
        title: 'Data Analyst Trainee',
        company: 'Happiest Minds Technologies',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        location: 'Whitefield, Bengaluru',
        salary: '₹5.5-7 LPA',
        experienceRequired: 'Fresher',
        skillsRequired: ['SQL', 'Python', 'Power BI', 'Excel'],
        openings: 4,
        status: 'Active',
        deadline: new Date('2026-09-20'),
        description: 'Analyze data streams, build dashboard visualizations, and compile statistics report cards.',
        recruiterEmail: 'naveen@happiestminds-demo.com'
      }
    ];

    const jobs = [];
    for (const jd of jobsData) {
      const rec = recruiters.find(r => r.user.email === jd.recruiterEmail);
      if (!rec) continue;

      const j = await Job.create({
        title: jd.title,
        company: jd.company,
        companyLogo: rec.profile.companyLogo,
        recruiterId: rec.user._id,
        jobType: jd.jobType,
        workMode: jd.workMode,
        location: jd.location,
        salary: jd.salary,
        experienceRequired: jd.experienceRequired,
        skillsRequired: jd.skillsRequired,
        description: jd.description,
        openings: jd.openings,
        status: jd.status,
        deadline: jd.deadline
      });
      jobs.push(j);
    }

    console.log('--- Seeding Projects & Workspace Teams ---');
    const kalpak = students.find(s => s.name === 'Kalpak H S');
    const manjunath = students.find(s => s.name === 'Manjunath Gowda');
    const keerthana = students.find(s => s.name === 'Keerthana R');
    const rakshith = students.find(s => s.name === 'Rakshith Kumar');
    const shwetha = students.find(s => s.name === 'Shwetha N');

    const shashidhar = mentors.find(m => m.name === 'Dr. Shashidhar Hegde');
    const kavithaMentor = mentors.find(m => m.name === 'Prof. Kavitha M');
    const ramesh = mentors.find(m => m.name === 'Prof. Ramesh Kumar N');

    const projectData = [
      {
        title: 'Developer Collaboration Platform',
        ownerId: kalpak._id,
        mentorId: shashidhar._id,
        category: 'Full Stack Development',
        status: 'In Progress',
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        repoUrl: 'https://github.com/kalpakhs/devconnect',
        demoUrl: 'https://devconnect-demo.vercel.app',
        rolesNeeded: [
          { roleName: 'Backend Developer', skillsRequired: ['Node.js', 'Express'], status: 'Filled' },
          { roleName: 'UI/UX Designer', skillsRequired: ['Figma'], status: 'Open' }
        ],
        difficulty: 'advanced',
        duration: '4 Months',
        workMode: 'remote',
        members: [
          { userId: kalpak._id, role: 'owner' },
          { userId: manjunath._id, role: 'member' },
          { userId: keerthana._id, role: 'member' }
        ],
        progress: 72
      },
      {
        title: 'Smart Parking Management System',
        ownerId: manjunath._id,
        mentorId: ramesh._id,
        category: 'IoT',
        status: 'Completed',
        skills: ['ESP32', 'Firebase', 'React'],
        rolesNeeded: [
          { roleName: 'UI Developer', skillsRequired: ['React', 'CSS'], status: 'Filled' }
        ],
        difficulty: 'intermediate',
        duration: '3 Months',
        workMode: 'hybrid',
        members: [
          { userId: manjunath._id, role: 'owner' },
          { userId: rakshith._id, role: 'member' }
        ],
        progress: 100
      },
      {
        title: 'Campus Placement Portal',
        ownerId: keerthana._id,
        mentorId: shashidhar._id,
        category: 'Web Development',
        status: 'Planning',
        skills: ['Spring Boot', 'React', 'MySQL'],
        rolesNeeded: [
          { roleName: 'Frontend Developer', skillsRequired: ['React'], status: 'Open' }
        ],
        difficulty: 'intermediate',
        duration: '3 Months',
        workMode: 'remote',
        members: [
          { userId: keerthana._id, role: 'owner' },
          { userId: kalpak._id, role: 'member' }
        ],
        progress: 18
      },
      {
        title: 'AI Resume Analyzer',
        ownerId: shwetha._id,
        mentorId: kavithaMentor._id,
        category: 'Artificial Intelligence',
        status: 'Draft',
        skills: ['Python', 'Flask', 'NLP'],
        rolesNeeded: [
          { roleName: 'Machine Learning Engineer', skillsRequired: ['Python', 'NLP'], status: 'Open' }
        ],
        difficulty: 'advanced',
        duration: '5 Months',
        workMode: 'remote',
        members: [
          { userId: shwetha._id, role: 'owner' }
        ],
        progress: 10
      },
      {
        title: 'Flutter UI Component Library',
        ownerId: rakshith._id,
        mentorId: ramesh._id,
        category: 'Mobile Application Development',
        status: 'In Progress',
        skills: ['Flutter', 'Dart'],
        rolesNeeded: [
          { roleName: 'Flutter Developer', skillsRequired: ['Flutter'], status: 'Filled' }
        ],
        difficulty: 'intermediate',
        duration: '2 Months',
        workMode: 'remote',
        members: [
          { userId: rakshith._id, role: 'owner' }
        ],
        progress: 58
      }
    ];

    const projects = [];
    for (const pd of projectData) {
      const proj = await Project.create({
        title: pd.title,
        description: `Collaborative workspace project for ${pd.title}. Dedicated to engineering excellent architecture and clean code.`,
        owner: pd.ownerId,
        ownerId: pd.ownerId,
        mentorId: pd.mentorId,
        category: pd.category,
        status: pd.status,
        skills: pd.skills,
        skillsRequired: pd.skills,
        repoUrl: pd.repoUrl || '',
        demoUrl: pd.demoUrl || '',
        rolesNeeded: pd.rolesNeeded,
        difficulty: pd.difficulty,
        duration: pd.duration,
        workMode: pd.workMode,
        members: pd.members.map(m => ({ userId: m.userId, role: m.role, joinedAt: new Date() }))
      });

      const newTeam = await Team.create({
        project: proj._id,
        owner: pd.ownerId,
        members: pd.members.map(m => ({ user: m.userId, role: m.role === 'owner' ? 'Owner' : 'Member' }))
      });

      const tasksToCreate = pd.title === 'Developer Collaboration Platform' ? [
        { title: 'Authentication Module', desc: 'Secure passwords using bcrypt and validate token endpoints.', status: 'done' },
        { title: 'Job Portal APIs', desc: 'Create REST endpoints for posting and shortlisting candidates.', status: 'done' },
        { title: 'Chat Module', desc: 'Implement socket.io triggers for group communication.', status: 'in-progress' },
        { title: 'Notification Service', desc: 'Send real-time workspace updates to connected members.', status: 'done' },
        { title: 'Resume Parser', desc: 'Add file parsing pipelines to read docx/pdf data.', status: 'todo' }
      ] : pd.title === 'AI Resume Analyzer' ? [
        { title: 'Literature Survey', desc: 'Survey existing open-source resume analysis libraries.', status: 'todo' },
        { title: 'Dataset Collection', desc: 'Gather mock profile documents and resumes.', status: 'todo' },
        { title: 'Model Selection', desc: 'Evaluate NLP libraries and transformer checkpoints.', status: 'todo' }
      ] : [
        { title: 'Setup project workspace config', desc: 'Setup package dependencies and workspace structure.', status: pd.status === 'Completed' ? 'done' : 'in-progress' }
      ];

      for (let tIdx = 0; tIdx < tasksToCreate.length; tIdx++) {
        const tc = tasksToCreate[tIdx];
        const statusMap = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };

        const taskDoc = await Task.create({
          projectId: proj._id,
          title: tc.title,
          description: tc.desc,
          assigneeId: pd.ownerId,
          status: tc.status,
          createdBy: pd.ownerId,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (tIdx + 5)),
          order: tIdx
        });

        newTeam.tasks.push({
          title: taskDoc.title,
          description: taskDoc.description,
          assignedTo: pd.ownerId,
          status: statusMap[tc.status],
          dueDate: taskDoc.dueDate
        });
      }

      const fileUrl = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80';
      await WorkspaceFile.create({
        projectId: proj._id,
        uploadedBy: pd.ownerId,
        fileUrl,
        fileName: 'workspace_design.png',
        fileType: 'image/png'
      });

      newTeam.files.push({
        name: 'workspace_design.png',
        url: fileUrl,
        uploadedBy: pd.ownerId,
        uploadedAt: new Date()
      });

      await newTeam.save();
      proj.team = newTeam._id;
      await proj.save();

      projects.push(proj);
    }

    console.log('--- Seeding Mentor Activities, Reviews, Ratings ---');
    const devPlatform = projects.find(p => p.title === 'Developer Collaboration Platform');
    const smartParking = projects.find(p => p.title === 'Smart Parking Management System');
    const campusPlacement = projects.find(p => p.title === 'Campus Placement Portal');
    const resumeAnalyzer = projects.find(p => p.title === 'AI Resume Analyzer');
    const flutterLibrary = projects.find(p => p.title === 'Flutter UI Component Library');

    await MentorReview.create({
      projectId: devPlatform._id,
      mentorId: shashidhar._id,
      feedback: 'Approved Milestone 1: Requirement doc and database schema design complete.',
      rating: 5,
      milestoneStatus: 'approved'
    });
    await MentorReview.create({
      projectId: devPlatform._id,
      mentorId: shashidhar._id,
      feedback: 'Approved Milestone 2: Auth controller logic and job portal APIs are robust.',
      rating: 5,
      milestoneStatus: 'approved'
    });

    await MentorReview.create({
      projectId: campusPlacement._id,
      mentorId: shashidhar._id,
      feedback: 'Approved Proposal: Placement portal outline and technology choices approved.',
      rating: 4,
      milestoneStatus: 'approved'
    });

    await MentorReview.create({
      projectId: resumeAnalyzer._id,
      mentorId: kavithaMentor._id,
      feedback: 'Improve dataset quality. Add validation evaluation metrics before starting Flask prototype.',
      rating: 4,
      milestoneStatus: 'resubmission_requested'
    });

    await MentorReview.create({
      projectId: smartParking._id,
      mentorId: ramesh._id,
      feedback: 'Approved Final Report: System successfully verified and ESP32 hardware integrated.',
      rating: 5,
      milestoneStatus: 'approved'
    });

    await MentorReview.create({
      projectId: flutterLibrary._id,
      mentorId: ramesh._id,
      feedback: 'Approved Milestone 1: Setup Flutter custom widget library.',
      rating: 5,
      milestoneStatus: 'approved'
    });

    console.log('--- Seeding Meetings (8 meetings total) ---');
    const meetingsList = [
      { title: 'Requirement Discussion', desc: 'Discuss user specifications and sprint outlines.', date: new Date('2026-08-05T14:30:00') },
      { title: 'UI Review', desc: 'Walkthrough Figma components and React view panels.', date: new Date('2026-08-12T15:00:00') },
      { title: 'Backend Review', desc: 'Verify MongoDB schema mappings and API structures.', date: new Date('2026-08-19T10:30:00') }
    ];

    for (const m of meetingsList) {
      await Meeting.create({
        projectId: devPlatform._id,
        mentorId: shashidhar._id,
        title: m.title,
        description: m.desc,
        dateTime: m.date,
        meetLink: 'https://meet.google.com/xyz-qprs-tuv',
        status: 'Completed'
      });
    }

    for (let i = 0; i < 5; i++) {
      const projIdx = i % projects.length;
      await Meeting.create({
        projectId: projects[projIdx]._id,
        mentorId: projects[projIdx].mentorId,
        title: `Weekly Review Sync Meeting #${i + 1}`,
        description: 'Progress review and task board mapping check-in.',
        dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 1)),
        meetLink: 'https://meet.google.com/meet-link-sync',
        status: 'Scheduled'
      });
    }

    console.log('--- Seeding Applications & Offers ---');
    const anand = recruiters.find(r => r.user.name === 'Anand Prakash');
    const pooja = recruiters.find(r => r.user.name === 'Pooja Shetty');
    const naveen = recruiters.find(r => r.user.name === 'Naveen Kumar');

    const frontendIntern = jobs.find(j => j.title === 'Frontend Developer Intern');
    const javaBackend = jobs.find(j => j.title === 'Java Backend Developer');
    const fullStackJob = jobs.find(j => j.title === 'Full Stack Developer');
    const flutterIntern = jobs.find(j => j.title === 'Flutter Developer Intern');
    const dataAnalyst = jobs.find(j => j.title === 'Data Analyst Trainee');

    // Applications
    await JobApplication.create({
      jobId: fullStackJob._id,
      developerId: kalpak._id,
      status: 'Shortlisted',
      resume: kalpak.resumeUrl,
      github: kalpak.socialLinks.github,
      linkedin: kalpak.socialLinks.linkedin,
      hackerrank: kalpak.hackerrank
    });

    await JobApplication.create({
      jobId: frontendIntern._id,
      developerId: kalpak._id,
      status: 'Applied',
      resume: kalpak.resumeUrl,
      github: kalpak.socialLinks.github
    });

    await JobApplication.create({
      jobId: frontendIntern._id,
      developerId: manjunath._id,
      status: 'Interview',
      github: 'https://github.com/manjunath'
    });

    await JobApplication.create({
      jobId: javaBackend._id,
      developerId: keerthana._id,
      status: 'Shortlisted',
      github: 'https://github.com/keerthana'
    });

    await JobApplication.create({
      jobId: flutterIntern._id,
      developerId: rakshith._id,
      status: 'Applied',
      github: 'https://github.com/rakshith'
    });

    await JobApplication.create({
      jobId: dataAnalyst._id,
      developerId: shwetha._id,
      status: 'Applied',
      github: 'https://github.com/shwetha'
    });

    await Shortlist.create({
      recruiterId: anand.user._id,
      developerId: kalpak._id,
      stage: 'Shortlisted',
      notes: 'Anand Prakash shortlisted Kalpak H S.'
    });
    await Shortlist.create({
      recruiterId: naveen.user._id,
      developerId: keerthana._id,
      stage: 'Shortlisted',
      notes: 'Naveen Kumar shortlisted Keerthana R.'
    });

    await RecruiterBookmark.create({
      recruiterId: anand.user._id,
      developerId: kalpak._id
    });
    await RecruiterBookmark.create({
      recruiterId: naveen.user._id,
      developerId: shwetha._id
    });

    // Scheduled / Completed Interviews
    await Interview.create({
      recruiterId: pooja.user._id,
      developerId: manjunath._id,
      title: 'Technical Interview - Frontend Developer Intern',
      description: 'System design walkthrough and react coding task.',
      dateTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
      timezone: 'GMT+5:30',
      mode: 'Online',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'Completed',
      feedback: 'Superb knowledge of React Hooks and Tailwind CSS styling.'
    });

    await Interview.create({
      recruiterId: anand.user._id,
      developerId: kalpak._id,
      title: 'Technical Portfolio Review & System Design',
      description: 'MERN architecture optimization and spring framework discussion.',
      dateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      timezone: 'GMT+5:30',
      mode: 'Online',
      meetLink: 'https://meet.google.com/xyz-qprs-tuv',
      status: 'Scheduled'
    });

    // Offer
    await Offer.create({
      recruiterId: naveen.user._id,
      developerId: keerthana._id,
      jobId: javaBackend._id,
      company: 'Happiest Minds Technologies',
      role: 'Java Backend Developer',
      salary: '₹7 LPA',
      joiningDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      location: 'Whitefield, Bengaluru',
      status: 'Sent'
    });

    console.log('--- Seeding Messages (50+ chat messages total) ---');
    for (let i = 0; i < 20; i++) {
      await RecruiterMessage.create({
        senderId: i % 2 === 0 ? anand.user._id : kalpak._id,
        recipientId: i % 2 === 0 ? kalpak._id : anand.user._id,
        content: `Sourcing query check-in message #${i + 1}. Discussing contract terms and remote options.`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * (30 - i))
      });
    }

    const tPlatform = await Team.findOne({ project: devPlatform._id });
    if (tPlatform) {
      for (let i = 0; i < 30; i++) {
        const senders = [kalpak._id, manjunath._id, keerthana._id];
        await Message.create({
          team: tPlatform._id,
          sender: senders[i % senders.length],
          content: `Team discussion thread #${i + 1} regarding Developer Collaboration Platform milestones.`,
          createdAt: new Date(Date.now() - 1000 * 60 * 10 * (30 - i))
        });
      }
    }

    console.log('--- Seeding Notifications (35+ notifications total) ---');
    const suggestedNotifs = [
      { recipient: kalpak._id, title: 'Mentor approved Milestone 2.', message: 'Dr. Shashidhar Hegde approved Milestone 2 of Developer Collaboration Platform.' },
      { recipient: kalpak._id, title: 'Recruiter shortlisted your application.', message: 'Anand Prakash from Zensof Technologies shortlisted your Full Stack Developer application.' },
      { recipient: kalpak._id, title: 'Interview scheduled by Zensof Technologies.', message: 'An interview has been scheduled for Wednesday afternoon.' },
      { recipient: kalpak._id, title: 'New teammate joined project.', message: 'Keerthana R has joined Developer Collaboration Platform.' },
      { recipient: manjunath._id, title: 'Project marked as Completed.', message: 'Prof. Ramesh Kumar N has marked Smart Parking Management System as Completed.' },
      { recipient: manjunath._id, title: 'Interview feedback available.', message: 'Pooja Shetty has submitted positive frontend coding feedback.' },
      { recipient: manjunath._id, title: 'Mentor issued certificate.', message: 'Ramesh Kumar N has issued the IoT project certificate.' },
      { recipient: keerthana._id, title: 'Proposal approved.', message: 'Dr. Shashidhar Hegde approved the proposal for Campus Placement Portal.' },
      { recipient: keerthana._id, title: 'Shortlisted by Happiest Minds.', message: 'Naveen Kumar shortlisted your Java Backend Developer application.' },
      { recipient: rakshith._id, title: 'New task assigned.', message: 'Ramesh Kumar N assigned the UI libraries review task.' },
      { recipient: rakshith._id, title: 'Flutter interview application under review.', message: 'Razorpay has moved your Flutter Developer Intern application to review status.' },
      { recipient: shwetha._id, title: 'Mentor requested project revision.', message: 'Prof. Kavitha M requested revisions on the dataset description.' },
      { recipient: shwetha._id, title: 'Recruiter viewed resume.', message: 'Naveen Kumar from Happiest Minds Technologies viewed your resume.' }
    ];

    for (const sn of suggestedNotifs) {
      await Notification.create({
        recipient: sn.recipient,
        sender: adminUser._id,
        type: 'System',
        title: sn.title,
        message: sn.message,
        isRead: false
      });
    }

    for (let i = 0; i < 25; i++) {
      const student = students[i % students.length];
      await Notification.create({
        recipient: student._id,
        sender: mentors[i % mentors.length]._id,
        type: 'System',
        title: 'Weekly sync update',
        message: 'Weekly milestone review has been generated on the team board.',
        isRead: true
      });
    }

    await ActivityLog.create({
      actorId: shashidhar._id,
      action: 'Approved project proposal for Campus Placement Portal',
      targetType: 'Project',
      targetId: campusPlacement._id
    });
    await ActivityLog.create({
      actorId: ramesh._id,
      action: 'Marked project Smart Parking Management System as Completed',
      targetType: 'Project',
      targetId: smartParking._id
    });

    console.log('==================================================');
    console.log('  PRODUCTION SEED: Bengaluru Demo Dataset Loaded! ');
    console.log('==================================================');

  } catch (error) {
    console.error('Error during database seed execution:', error.message);
  }
};

module.exports = { seedRealData };
