const Message = require('../models/Message');
const RecruiterMessage = require('../models/RecruiterMessage');

const activeUsers = new Map(); // userId -> socketId

const initSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Track online user
    socket.on('user_connected', (userId) => {
      if (userId) {
        socket.userId = userId;
        activeUsers.set(userId, socket.id);
        io.emit('user_status_changed', { userId, status: 'online' });
        console.log(`User ${userId} associated with socket ${socket.id}`);
      }
    });

    // Join team workspace chat room
    socket.on('join_room', ({ teamId }) => {
      if (teamId) {
        socket.join(teamId);
        console.log(`Socket ${socket.id} joined team room: ${teamId}`);
      }
    });

    // Leave team workspace chat room
    socket.on('leave_room', ({ teamId }) => {
      if (teamId) {
        socket.leave(teamId);
        console.log(`Socket ${socket.id} left team room: ${teamId}`);
      }
    });

    // Handle incoming chat message
    socket.on('send_message', async ({ teamId, content, attachments }) => {
      try {
        if (!teamId || !socket.userId) return;

        const message = await Message.create({
          team: teamId,
          sender: socket.userId,
          content,
          attachments: attachments || [],
        });

        const populatedMsg = await Message.findById(message._id).populate(
          'sender',
          'name avatar role'
        );

        io.to(teamId).emit('message_received', populatedMsg);
      } catch (err) {
        console.error('Error broadcasting message:', err.message);
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ teamId, username, isTyping }) => {
      if (teamId) {
        socket.to(teamId).emit('typing_status', { teamId, username, isTyping });
      }
    });

    // -------------------------------------------------------------
    // Recruiter-developer live message
    // -------------------------------------------------------------
    socket.on('recruiter_send_message', async ({ recipientId, content, attachments }) => {
      try {
        if (!recipientId || !socket.userId) return;

        const message = await RecruiterMessage.create({
          senderId: socket.userId,
          recipientId,
          content,
          attachments: attachments || [],
          isRead: false
        });

        const populatedMsg = await RecruiterMessage.findById(message._id)
          .populate('senderId', 'name avatar role')
          .populate('recipientId', 'name avatar role');

        // Emits to recipient if online
        const recipientSocketId = activeUsers.get(recipientId.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('recruiter_message_received', populatedMsg);
        }

        // Emits back to sender
        socket.emit('recruiter_message_sent', populatedMsg);
      } catch (err) {
        console.error('Error broadcasting recruiter message:', err.message);
      }
    });

    // Handle recruiter typing
    socket.on('recruiter_typing', ({ recipientId, isTyping }) => {
      if (recipientId) {
        const recipientSocketId = activeUsers.get(recipientId.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('recruiter_typing_status', { senderId: socket.userId, isTyping });
        }
      }
    });

    // Handle recruiter read receipt
    socket.on('recruiter_read_receipt', async ({ partnerId }) => {
      try {
        if (!partnerId || !socket.userId) return;

        await RecruiterMessage.updateMany(
          { senderId: partnerId, recipientId: socket.userId, isRead: false },
          { $set: { isRead: true } }
        );

        const partnerSocketId = activeUsers.get(partnerId.toString());
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('recruiter_messages_read', { readerId: socket.userId });
        }
      } catch (err) {
        console.error('Error handling recruiter read receipt:', err.message);
      }
    });

    // Handle explicit disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        io.emit('user_status_changed', { userId: socket.userId, status: 'offline' });
      }
    });
  });
};

// Helper function to send real-time notification to user if online
const sendRealTimeNotification = (io, recipientId, notification) => {
  const socketId = activeUsers.get(recipientId.toString());
  if (socketId && io) {
    io.to(socketId).emit('notification_received', notification);
    console.log(`Pushed real-time notification to user ${recipientId}`);
  }
};

module.exports = {
  initSockets,
  sendRealTimeNotification,
  activeUsers,
};
