const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../Models/User');

dotenv.config();

const seedMaster = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if master already exists
    const existingMaster = await User.findOne({ email: 'master@example.com' });
    if (existingMaster) {
      console.log('Master user already exists');
      process.exit(0);
    }

    // Create master user
    const master = await User.create({
      firstName: 'Master',
      lastName: 'Test',
      email: 'master@example.com',
      password: 'master123',
      role: 'master',
      userId: 'MS-0001',
      dateOfBirth: new Date('1990-01-01'),
      age: 34,
      gender: 'other',
    });

    console.log('Master user created successfully:');
    console.log(`  Email: ${master.email}`);
    console.log(`  Password: master123`);
    console.log(`  Master ID: ${master.userId}`);
    console.log(`  Role: ${master.role}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding master user:', error);
    process.exit(1);
  }
};

// Run seed function
if (require.main === module) {
  seedMaster();
}

module.exports = seedMaster;

