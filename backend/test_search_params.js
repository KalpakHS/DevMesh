const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/devmesh');
    console.log('Connected to DB.');

    // Simulate query parameters like the frontend: search='', skills='', college='', availability='', minRep='', sortBy='reputation'
    const query = { role: 'User' };
    
    // Check what happens if empty strings are passed (Express sets empty strings if query param is passed like ?search=)
    const search = '';
    const skills = 'react, node';
    const college = '';
    const availability = '';
    const minRep = '';
    const sortBy = 'reputation';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => new RegExp(s.trim(), 'i'));
      query.skills = { $in: skillsArray };
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (availability) {
      query.availabilityStatus = availability;
    }

    if (minRep) {
      query.reputation = { $gte: parseInt(minRep) };
    }

    console.log('Constructed query:', query);
    const devs = await User.find(query);
    console.log('Result count:', devs.length);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

test();
