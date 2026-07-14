const Badge = require('../models/Badge');
const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// Seed default badges
const seedBadges = async () => {
  const defaultBadges = [
    {
      name: 'First Contribution',
      description: 'First task ever marked Done',
      icon: 'CheckCircle',
      milestone: 'first_contribution',
    },
    {
      name: 'Team Player',
      description: 'Completed 3 projects with different teams',
      icon: 'Users',
      milestone: 'team_player',
    },
    {
      name: 'Mentor\'s Choice',
      description: '3+ milestone approvals from the same mentor',
      icon: 'Crown',
      milestone: 'mentors_choice',
    },
    {
      name: 'Consistency',
      description: 'Commits or tasks in 4 consecutive weeks',
      icon: 'Calendar',
      milestone: 'consistency',
    },
    {
      name: 'Rising Star',
      description: 'Earned +50 REP in a single 30-day window',
      icon: 'Award',
      milestone: 'rising_star',
    },
    {
      name: 'Code Ninja',
      description: 'Reached 150 reputation points on the platform',
      icon: 'Zap',
      milestone: 'code_ninja',
    },
    {
      name: 'Community Champion',
      description: 'Received 5 or more reviews/endorsements',
      icon: 'Heart',
      milestone: 'community_champion',
    },
  ];

  try {
    for (const b of defaultBadges) {
      await Badge.findOneAndUpdate({ milestone: b.milestone }, b, {
        upsert: true,
        new: true,
      });
    }
    console.log('Gamification Badges seeded successfully.');
  } catch (error) {
    console.error('Error seeding badges:', error.message);
  }
};

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId).populate('badges');
    if (!user) return;

    const ownedBadges = new Set(user.badges.map((b) => b.milestone));
    const Task = require('../models/Task');
    const RepEvent = require('../models/RepEvent');
    const MentorReview = require('../models/MentorReview');

    // 1. First Contribution
    if (!ownedBadges.has('first_contribution')) {
      const doneCount = await Task.countDocuments({ assigneeId: userId, status: 'done' });
      if (doneCount >= 1) {
        await awardBadge(user, 'first_contribution');
      }
    }

    // 2. Team Player
    if (!ownedBadges.has('team_player')) {
      const completedCount = await Project.countDocuments({
        'members.userId': userId,
        status: 'Completed'
      });
      if (completedCount >= 3) {
        await awardBadge(user, 'team_player');
      }
    }

    // 3. Mentor's Choice
    if (!ownedBadges.has('mentors_choice')) {
      const userProjects = await Project.find({ 'members.userId': userId });
      const pIds = userProjects.map((p) => p._id);
      
      const approvals = await MentorReview.aggregate([
        { $match: { projectId: { $in: pIds }, milestoneStatus: 'approved' } },
        { $group: { _id: '$mentorId', count: { $sum: 1 } } },
        { $match: { count: { $gte: 3 } } }
      ]);
      if (approvals.length > 0) {
        await awardBadge(user, 'mentors_choice');
      }
    }

    // 4. Consistency
    if (!ownedBadges.has('consistency')) {
      const activityDays = await Task.find({ assigneeId: userId, status: 'done' }).select('updatedAt');
      const weeksActive = new Set(activityDays.map((a) => {
        const d = new Date(a.updatedAt);
        const onejan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      }));
      if (weeksActive.size >= 4) {
        await awardBadge(user, 'consistency');
      }
    }

    // 5. Rising Star
    if (!ownedBadges.has('rising_star')) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const repSum = await RepEvent.aggregate([
        { $match: { userId: user._id, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]);
      if (repSum.length > 0 && repSum[0].total >= 50) {
        await awardBadge(user, 'rising_star');
      }
    }

    // 6. Code Ninja
    if (!ownedBadges.has('code_ninja') && user.reputation >= 150) {
      await awardBadge(user, 'code_ninja');
    }

    // 7. Community Champion
    if (!ownedBadges.has('community_champion')) {
      const reviewCount = await Review.countDocuments({ reviewee: userId });
      if (reviewCount >= 5) {
        await awardBadge(user, 'community_champion');
      }
    }
  } catch (err) {
    console.error(`Error checking badges for user ${userId}:`, err.message);
  }
};

const awardBadge = async (user, milestone) => {
  const badge = await Badge.findOne({ milestone });
  if (!badge) return;

  // Add badge to user
  user.badges.push(badge._id);
  await user.save();

  // Create notification
  await Notification.create({
    recipient: user._id,
    type: 'System',
    title: 'New Achievement Earned! 🏆',
    message: `Congratulations! You have been awarded the "${badge.name}" badge: ${badge.description}`,
    link: `/profile/${user._id}`,
  });

  console.log(`Badge "${badge.name}" awarded to user ${user.name}`);
};

module.exports = {
  seedBadges,
  checkAndAwardBadges,
};
