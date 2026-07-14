const Task = require('../models/Task');
const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');
const { emitEvent } = require('../services/eventService');

// Mock GitHub OAuth redirect callback
const linkGithubAccount = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ status: 'error', message: 'GitHub username is required.' });
    }

    const userObj = await User.findById(req.user._id);
    if (!userObj) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    if (!userObj.portfolioLinks) {
      userObj.portfolioLinks = {};
    }
    userObj.portfolioLinks.github = `https://github.com/${username}`;
    await userObj.save();

    res.status(200).json({
      status: 'success',
      message: `GitHub account @${username} linked successfully!`,
      data: { portfolioLinks: userObj.portfolioLinks }
    });
  } catch (error) {
    next(error);
  }
};

// Process GitHub Webhook Push payload
const handlePushWebhook = async (req, res, next) => {
  try {
    const payload = req.body;
    console.log('[GitHub Webhook] Push received for repo:', payload.repository?.html_url);

    const commits = payload.commits || [];
    const io = req.app.get('io');

    for (const commit of commits) {
      const message = commit.message || '';
      console.log(`[GitHub Webhook] Processing commit: "${message}"`);

      // Match patterns: #resolve <taskId>, #done <taskId>, #close <taskId>, or ticket keywords like #done Ticket #1
      const match = message.match(/#(resolve|done|close)\s+([a-f0-9]{24}|Ticket\s*#\d+)/i);
      
      if (match) {
        const keyword = match[2];
        let task = null;

        // Try looking up by Task ObjectId
        if (keyword.match(/^[a-f0-9]{24}$/i)) {
          task = await Task.findById(keyword);
        } else {
          // Try finding a task matching the ticket sequence in the title
          // e.g. "Task Milestone Ticket #1"
          task = await Task.findOne({
            title: { $regex: new RegExp(keyword, 'i') }
          });
        }

        if (task && task.status !== 'done') {
          task.status = 'done';
          task.updatedAt = new Date();
          await task.save();

          // Also sync to legacy Team tasks array
          const team = await Team.findOne({ project: task.projectId });
          if (team) {
            const legacyTask = team.tasks.find(t => t.title === task.title);
            if (legacyTask) {
              legacyTask.status = 'Done';
              await team.save();
            }
          }

          // Look up user by commit author email
          let assignee = null;
          if (commit.author?.email) {
            assignee = await User.findOne({ email: commit.author.email });
          }
          const awardeeId = assignee?._id || task.assigneeId || team?.owner;

          if (awardeeId) {
            await emitEvent(io, 'GITHUB_RESOLVE_TASK', {
              projectId: task.projectId,
              actorId: awardeeId,
              recipientId: awardeeId,
              targetId: task._id,
              targetType: 'Task',
              points: 2, // Collaborator +2 REP points as per Section 3
              title: 'Task Resolved via Git Commit! 🐙',
              message: `You successfully resolved task "${task.title}" via git push commit: "${message}" (+2 REP)`,
              link: `/teams/${team?._id || ''}`,
              actionText: `pushed commit: "${message}" - Resolved task "${task.title}"`
            });
          }
        }
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'GitHub webhook parsed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  linkGithubAccount,
  handlePushWebhook,
};
