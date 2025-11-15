const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recipe = require('../Models/Recipe');

dotenv.config();

const sampleRecipes = [
  {
    name: 'Rice and Curry (Bath Kirata)',
    mainIngredient: 'Rice',
    otherIngredients: [
      'Coconut Milk',
      'Curry Leaves',
      'Onions',
      'Garlic',
      'Ginger',
      'Turmeric',
      'Chili Powder',
      'Salt'
    ],
    instructions: `1. Wash and cook rice with coconut milk until fluffy
2. Heat oil in a pan and add curry leaves, onions, garlic, and ginger
3. Add turmeric and chili powder and stir well
4. Add vegetables or meat and cook until tender
5. Season with salt and serve hot with rice`,
    nutrition: {
      calories: 350,
      carbohydrates: 65,
      proteins: 8,
      fat: 8,
      fiber: 3,
    },
    tags: ['traditional', 'vegetarian', 'sri-lankan', 'healthy'],
  },
  {
    name: 'Kottu Roti',
    mainIngredient: 'Roti',
    otherIngredients: [
      'Vegetables',
      'Eggs',
      'Onions',
      'Carrots',
      'Cabbage',
      'Leek',
      'Chili',
      'Soy Sauce',
      'Curry Powder',
      'Salt'
    ],
    instructions: `1. Cut roti into small pieces
2. Heat oil in a large pan or on a hot plate
3. Add chopped vegetables and stir-fry
4. Add eggs and scramble
5. Add roti pieces and mix well
6. Season with curry powder, soy sauce, and salt
7. Continue chopping and mixing until well combined
8. Serve hot`,
    nutrition: {
      calories: 420,
      carbohydrates: 55,
      proteins: 15,
      fat: 12,
      fiber: 5,
    },
    tags: ['traditional', 'street-food', 'sri-lankan', 'spicy'],
  },
  {
    name: 'Hoppers (Appa)',
    mainIngredient: 'Rice Flour',
    otherIngredients: [
      'Coconut Milk',
      'Yeast',
      'Sugar',
      'Salt',
      'Eggs'
    ],
    instructions: `1. Mix rice flour with coconut milk to make a smooth batter
2. Add yeast, sugar, and salt
3. Let the batter ferment for 4-6 hours
4. Heat a hopper pan (appachatti) over medium heat
5. Pour a ladleful of batter and swirl to coat the pan
6. Crack an egg in the center (optional)
7. Cover and cook until edges are crispy
8. Serve hot with curry or sambol`,
    nutrition: {
      calories: 280,
      carbohydrates: 45,
      proteins: 6,
      fat: 8,
      fiber: 2,
    },
    tags: ['traditional', 'breakfast', 'sri-lankan', 'vegetarian'],
  },
  {
    name: 'String Hoppers (Idiyappam)',
    mainIngredient: 'Rice Flour',
    otherIngredients: [
      'Water',
      'Salt',
      'Coconut Milk',
      'Coconut Sambol'
    ],
    instructions: `1. Mix rice flour with hot water and salt to make a soft dough
2. Use an idiyappam press to make string hoppers
3. Place the pressed strings on idiyappam plates
4. Steam for 5-7 minutes until cooked
5. Serve hot with coconut milk and coconut sambol
6. Can be served with curry as well`,
    nutrition: {
      calories: 220,
      carbohydrates: 48,
      proteins: 4,
      fat: 2,
      fiber: 1.5,
    },
    tags: ['traditional', 'breakfast', 'sri-lankan', 'vegetarian', 'gluten-free'],
  },
  {
    name: 'Kola Kenda (Herbal Porridge)',
    mainIngredient: 'Gotukola (Centella)',
    otherIngredients: [
      'Rice',
      'Coconut Milk',
      'Water',
      'Salt',
      'Turmeric',
      'Black Pepper'
    ],
    instructions: `1. Wash gotukola leaves thoroughly
2. Blend gotukola with a little water to make a paste
3. Cook rice in water until soft
4. Add the gotukola paste and mix well
5. Add coconut milk and bring to a boil
6. Season with salt, turmeric, and black pepper
7. Simmer for 5 minutes until well combined
8. Serve hot as a healthy breakfast or meal`,
    nutrition: {
      calories: 180,
      carbohydrates: 32,
      proteins: 4,
      fat: 4,
      fiber: 3,
    },
    tags: ['traditional', 'healthy', 'herbal', 'vegetarian', 'sri-lankan', 'medicinal'],
  },
];

const seedRecipes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing recipes
    const deleteResult = await Recipe.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing recipes`);

    // Insert sample recipes
    const insertedRecipes = await Recipe.insertMany(sampleRecipes);
    console.log(`Successfully seeded ${insertedRecipes.length} recipes`);

    // Print summary
    console.log('\nSeeded recipes:');
    insertedRecipes.forEach((recipe) => {
      console.log(`  - ${recipe.name} (Main: ${recipe.mainIngredient})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding recipes:', error);
    process.exit(1);
  }
};

// Run seed function
if (require.main === module) {
  seedRecipes();
}

module.exports = seedRecipes;



