const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Team = require('./models/Team');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
require('dotenv').config();

const reset = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devmesh';
    await mongoose.connect(connStr);
    console.log('Connected to DB for reset.');

    await User.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('Successfully deleted all collections. Database is ready for seeding!');
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err.message);
    process.exit(1);
  }
};

reset();
