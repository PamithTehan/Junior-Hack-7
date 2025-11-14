const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FoodItem = require('../Models/FoodItem');

dotenv.config();

// This file is kept for backward compatibility
// It now calls the CSV seeding script
const seedFoodsFromCSV = require('./seedFoodsFromCSV');

const seedFoods = async () => {
  try {
    console.log('seedFoods.js: Redirecting to CSV seeding...');
    console.log('Note: Use "npm run seed:csv" to seed from CSV file');
    await seedFoodsFromCSV();
  } catch (error) {
    console.error('Error in seedFoods:', error);
    process.exit(1);
  }
};

// Run seed function
if (require.main === module) {
  seedFoods();
}

module.exports = seedFoods;
