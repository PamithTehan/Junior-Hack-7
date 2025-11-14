const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../Models/User');

dotenv.config();

const clearUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all users
    const deleteResult = await User.deleteMany({});
    console.log(`Successfully deleted ${deleteResult.deletedCount} users`);

    process.exit(0);
  } catch (error) {
    console.error('Error clearing users:', error);
    process.exit(1);
  }
};

// Run clear function
if (require.main === module) {
  clearUsers();
}

module.exports = clearUsers;

