const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/devmesh');
    const u = await User.findById('6a55507be50c18e4fa709082');
    console.log('User found:', u);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

run();
