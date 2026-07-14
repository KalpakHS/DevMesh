require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const { seedBadges } = require('./services/badgeService');
const { seedRealData } = require('./services/seedService');
const { initSockets } = require('./sockets/socketManager');
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');

// Initialize database
connectDB().then(() => {
  seedBadges();
  seedRealData();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Bind Socket.IO manager
initSockets(io);

// Expose io globally on app request to push notifications from REST controllers
app.set('io', io);

// Security Headers & CORS
app.use(helmet({
  crossOriginResourcePolicy: false, // allow serving local files statically
}));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Serving uploaded assets statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes configuration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/mentor', require('./routes/mentorRoutes'));
app.use('/api/recruiter', require('./routes/recruiterRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/mentor-requests', require('./routes/mentorRequestRoutes'));

// Unhandled route fallback
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
