const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ingredient = require('../Models/Ingredient');

dotenv.config();

const sampleFoods = [
  // Vegetables
  {
    name: 'Carrot',
    category: 'vegetables',
    nutrition: {
      calories: 41,
      carbohydrates: 10,
      proteins: 0.9,
      fiber: 2.8,
      fat: 0.2,
    },
    tags: ['low-calorie', 'vitamin-a', 'antioxidants'],
  },
  {
    name: 'Broccoli',
    category: 'vegetables',
    nutrition: {
      calories: 34,
      carbohydrates: 7,
      proteins: 2.8,
      fiber: 2.6,
      fat: 0.4,
    },
    tags: ['vitamin-c', 'fiber', 'antioxidants'],
  },
  {
    name: 'Spinach',
    category: 'vegetables',
    nutrition: {
      calories: 23,
      carbohydrates: 3.6,
      proteins: 2.9,
      fiber: 2.2,
      fat: 0.4,
    },
    tags: ['iron', 'vitamin-k', 'low-calorie'],
  },
  {
    name: 'Tomato',
    category: 'vegetables',
    nutrition: {
      calories: 18,
      carbohydrates: 3.9,
      proteins: 0.9,
      fiber: 1.2,
      fat: 0.2,
    },
    tags: ['lycopene', 'vitamin-c', 'antioxidants'],
  },
  {
    name: 'Bell Pepper',
    category: 'vegetables',
    nutrition: {
      calories: 31,
      carbohydrates: 7,
      proteins: 1,
      fiber: 2.5,
      fat: 0.3,
    },
    tags: ['vitamin-c', 'antioxidants', 'low-calorie'],
  },
  // Fruits
  {
    name: 'Banana',
    category: 'fruits',
    nutrition: {
      calories: 89,
      carbohydrates: 23,
      proteins: 1.1,
      fiber: 2.6,
      fat: 0.3,
    },
    tags: ['potassium', 'vitamin-b6', 'energy'],
  },
  {
    name: 'Apple',
    category: 'fruits',
    nutrition: {
      calories: 52,
      carbohydrates: 14,
      proteins: 0.3,
      fiber: 2.4,
      fat: 0.2,
    },
    tags: ['fiber', 'antioxidants', 'vitamin-c'],
  },
  {
    name: 'Orange',
    category: 'fruits',
    nutrition: {
      calories: 47,
      carbohydrates: 12,
      proteins: 0.9,
      fiber: 2.4,
      fat: 0.1,
    },
    tags: ['vitamin-c', 'fiber', 'antioxidants'],
  },
  {
    name: 'Mango',
    category: 'fruits',
    nutrition: {
      calories: 60,
      carbohydrates: 15,
      proteins: 0.8,
      fiber: 1.6,
      fat: 0.4,
    },
    tags: ['vitamin-a', 'vitamin-c', 'antioxidants'],
  },
  // Grains
  {
    name: 'Brown Rice',
    category: 'grains',
    nutrition: {
      calories: 111,
      carbohydrates: 23,
      proteins: 2.6,
      fiber: 1.8,
      fat: 0.9,
    },
    tags: ['whole-grain', 'fiber', 'complex-carb'],
  },
  {
    name: 'Oats',
    category: 'grains',
    nutrition: {
      calories: 389,
      carbohydrates: 66,
      proteins: 17,
      fiber: 11,
      fat: 7,
    },
    tags: ['fiber', 'protein', 'heart-healthy'],
  },
  {
    name: 'Quinoa',
    category: 'grains',
    nutrition: {
      calories: 368,
      carbohydrates: 64,
      proteins: 14,
      fiber: 7,
      fat: 6,
    },
    tags: ['complete-protein', 'fiber', 'gluten-free'],
  },
  // Proteins
  {
    name: 'Chicken Breast',
    category: 'proteins',
    nutrition: {
      calories: 165,
      carbohydrates: 0,
      proteins: 31,
      fiber: 0,
      fat: 3.6,
    },
    tags: ['high-protein', 'low-fat', 'lean-meat'],
  },
  {
    name: 'Eggs',
    category: 'proteins',
    nutrition: {
      calories: 143,
      carbohydrates: 1.1,
      proteins: 13,
      fiber: 0,
      fat: 10,
    },
    tags: ['protein', 'vitamin-b12', 'choline'],
  },
  {
    name: 'Tofu',
    category: 'proteins',
    nutrition: {
      calories: 76,
      carbohydrates: 1.9,
      proteins: 8,
      fiber: 0.3,
      fat: 4.8,
    },
    tags: ['plant-protein', 'calcium', 'vegan'],
  },
  {
    name: 'Salmon',
    category: 'proteins',
    nutrition: {
      calories: 208,
      carbohydrates: 0,
      proteins: 20,
      fiber: 0,
      fat: 12,
    },
    tags: ['omega-3', 'protein', 'vitamin-d'],
  },
  // Legumes
  {
    name: 'Lentils',
    category: 'legumes',
    nutrition: {
      calories: 116,
      carbohydrates: 20,
      proteins: 9,
      fiber: 8,
      fat: 0.4,
    },
    tags: ['protein', 'fiber', 'iron'],
  },
  {
    name: 'Chickpeas',
    category: 'legumes',
    nutrition: {
      calories: 164,
      carbohydrates: 27,
      proteins: 9,
      fiber: 8,
      fat: 2.6,
    },
    tags: ['protein', 'fiber', 'folate'],
  },
  {
    name: 'Black Beans',
    category: 'legumes',
    nutrition: {
      calories: 132,
      carbohydrates: 24,
      proteins: 9,
      fiber: 8.7,
      fat: 0.5,
    },
    tags: ['protein', 'fiber', 'antioxidants'],
  },
  // Dairy
  {
    name: 'Greek Yogurt',
    category: 'dairy',
    nutrition: {
      calories: 59,
      carbohydrates: 3.6,
      proteins: 10,
      fiber: 0,
      fat: 0.4,
    },
    tags: ['protein', 'probiotics', 'calcium'],
  },
  {
    name: 'Milk',
    category: 'dairy',
    nutrition: {
      calories: 61,
      carbohydrates: 4.8,
      proteins: 3.4,
      fiber: 0,
      fat: 3.3,
    },
    tags: ['calcium', 'protein', 'vitamin-d'],
  },
  // Nuts
  {
    name: 'Almonds',
    category: 'nuts',
    nutrition: {
      calories: 579,
      carbohydrates: 22,
      proteins: 21,
      fiber: 12,
      fat: 50,
    },
    tags: ['healthy-fats', 'vitamin-e', 'protein'],
  },
  {
    name: 'Walnuts',
    category: 'nuts',
    nutrition: {
      calories: 654,
      carbohydrates: 14,
      proteins: 15,
      fiber: 6.7,
      fat: 65,
    },
    tags: ['omega-3', 'healthy-fats', 'antioxidants'],
  },
];

const seedFoods = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing ingredients
    const deleteResult = await Ingredient.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing ingredients`);

    // Insert sample ingredients
    const insertedIngredients = await Ingredient.insertMany(sampleFoods);
    console.log(`Successfully seeded ${insertedIngredients.length} ingredients`);

    // Print summary
    console.log('\nSeeded ingredients:');
    insertedIngredients.forEach((ingredient) => {
      console.log(`  - ${ingredient.name} (${ingredient.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding foods:', error);
    process.exit(1);
  }
};

// Run seed function
if (require.main === module) {
  seedFoods();
}

module.exports = seedFoods;
