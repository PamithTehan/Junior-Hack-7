const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FoodItem = require('../Models/FoodItem');

dotenv.config();

const clearFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await FoodItem.deleteMany({});
    console.log(`Cleared ${result.deletedCount} food items from the database.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing foods:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  clearFoods();
}

module.exports = clearFoods;



