const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/devmesh');
    console.log('MongoDB connected successfully.');

    // Query 1: Default query (role: 'User')
    const query1 = { role: 'User' };
    const devs1 = await User.find(query1).limit(5);
    console.log('Query with role User returned count:', await User.countDocuments(query1));
    console.log('Sample Devs:', devs1.map(d => ({ name: d.name, role: d.role, availability: d.availabilityStatus })));

    process.exit(0);
  } catch (err) {
    console.error('Error during search test:', err.message);
    process.exit(1);
  }
};

test();
