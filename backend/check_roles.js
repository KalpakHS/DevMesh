const mongoose = require('mongoose');
const User = require('./models/User');

const check = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/devmesh');
    console.log('MongoDB connected successfully.');

    const roles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('User counts by role:', roles);

    const firstFive = await User.find().limit(5).select('name role email');
    console.log('Sample users:', firstFive);

    process.exit(0);
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
};

check();
