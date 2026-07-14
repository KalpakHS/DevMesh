const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/devmesh');
    const u = await User.findOne({ email: 'recru@gmail.com' });
    if (!u) {
      console.log('User not found.');
      process.exit(1);
    }
    u.password = 'password123';
    await u.save();
    console.log('Password reset successfully for recru@gmail.com.');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

run();
