const Notification = require('../models/Notification');
const RepEvent = require('../models/RepEvent');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const { checkAndAwardBadges } = require('./badgeService');
const { activeUsers } = require('../sockets/socketManager');

// Helper to push socket message if recipient is online
const pushSocketNotification = (io, recipientId, notification) => {
  if (!io || !recipientId) return;
  const socketId = activeUsers.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit('notification_received', notification);
  }
};

/**
 * Centrally emits a DevMesh workspace event, handling Mongoose transactional logs,
 * Socket.io notification fans, REP point alterations, and badge evaluations.
 */
const emitEvent = async (io, eventType, payload) => {
  console.log(`[Event Service] Emitting event: ${eventType}`);
  const { 
    projectId, 
    actorId, 
    recipientId, 
    targetId, 
    targetType, 
    points, 
    title, 
    message, 
    link, 
    actionText 
  } = payload;

  try {
    // 1. Create DB Notification if recipient is specified
    let dbNoti = null;
    if (recipientId && recipientId.toString() !== actorId?.toString()) {
      dbNoti = await Notification.create({
        recipient: recipientId,
        sender: actorId,
        type: eventType.includes('INVITE') ? 'Invitation' : 'System',
        title: title || 'Workspace Update 🔔',
        message: message || 'There has been an update in your workspace.',
        link: link || '',
      });
      // Push via socket
      pushSocketNotification(io, recipientId, dbNoti);
    }

    // 2. Log Activity to Project Timeline if projectId & actorId exist
    if (projectId && actorId) {
      await ActivityLog.create({
        projectId,
        actorId,
        action: actionText || `performed action ${eventType}`,
        targetType: targetType || 'Project',
        targetId: targetId || projectId,
      });

      // Broadcast activity to the team workspace room
      if (io) {
        io.to(projectId.toString()).emit('activity_logged', {
          projectId,
          actorId,
          action: actionText,
          createdAt: new Date(),
        });
      }
    }

    // 3. Handle Reputation changes if points specified
    if (points && recipientId) {
      await RepEvent.create({
        userId: recipientId,
        projectId: projectId || null,
        type: eventType,
        points,
      });

      // Update User global reputation score
      const user = await User.findById(recipientId);
      if (user) {
        user.reputation = (user.reputation || 0) + points;
        await user.save();

        // Broadcast reputation updated to trigger dashboard/widget refreshes
        if (io) {
          const socketId = activeUsers.get(recipientId.toString());
          if (socketId) {
            io.to(socketId).emit('reputation_updated', {
              userId: recipientId,
              newReputation: user.reputation,
            });
          }
        }

        // 4. Run badge evaluations
        await checkAndAwardBadges(recipientId);
      }
    }
  } catch (err) {
    console.error(`[Event Service Error] Failed to process event ${eventType}:`, err.message);
  }
};

module.exports = {
  emitEvent,
};
