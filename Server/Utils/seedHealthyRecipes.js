const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recipe = require('../Models/Recipe');

dotenv.config();

const healthyRecipes = [
  // Vegan Recipes
  {
    name: 'Gotu Kola Sambol',
    mainIngredient: 'Gotu Kola',
    otherIngredients: ['Red Onion', 'Lime', 'Coconut', 'Green Chili', 'Salt'],
    instructions: 'Wash and finely chop gotu kola. Mix with grated coconut, finely chopped onion, green chili, lime juice, and salt. Mix well and serve fresh.',
    nutrition: {
      calories: 45,
      carbohydrates: 8,
      proteins: 2,
      fat: 1,
      fiber: 4
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'low-calorie', 'antioxidant-rich']
  },
  {
    name: 'Mukunuwenna Mallung',
    mainIngredient: 'Mukunuwenna',
    otherIngredients: ['Coconut', 'Turmeric', 'Mustard Seeds', 'Curry Leaves', 'Onion'],
    instructions: 'Heat oil, add mustard seeds and curry leaves. Add chopped mukunuwenna, turmeric, grated coconut, and salt. Cook for 5-7 minutes until wilted.',
    nutrition: {
      calories: 52,
      carbohydrates: 7,
      proteins: 3,
      fat: 2,
      fiber: 3
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'iron-rich', 'fiber-rich']
  },
  {
    name: 'Jackfruit Curry',
    mainIngredient: 'Young Jackfruit',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Garlic', 'Ginger'],
    instructions: 'Cook young jackfruit pieces in coconut milk with curry powder, turmeric, sautéed onion, garlic, and ginger. Simmer until tender.',
    nutrition: {
      calories: 98,
      carbohydrates: 18,
      proteins: 2,
      fat: 2,
      fiber: 3
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'protein-rich', 'low-fat']
  },
  {
    name: 'Thibbatu Curry',
    mainIngredient: 'Thibbatu (Turkey Berry)',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Curry Leaves'],
    instructions: 'Sauté thibbatu with onion and curry leaves. Add coconut milk, curry powder, and turmeric. Simmer until vegetables are tender.',
    nutrition: {
      calories: 65,
      carbohydrates: 10,
      proteins: 3,
      fat: 2,
      fiber: 4
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'diabetes-friendly', 'antioxidant-rich']
  },
  {
    name: 'Brinjal Pahi',
    mainIngredient: 'Eggplant',
    otherIngredients: ['Coconut Vinegar', 'Green Chili', 'Red Onion', 'Mustard', 'Salt'],
    instructions: 'Roast eggplant until charred. Peel and mash. Mix with coconut vinegar, chopped green chili, onion, mustard, and salt. Serve as a pickle.',
    nutrition: {
      calories: 35,
      carbohydrates: 8,
      proteins: 1,
      fat: 0,
      fiber: 3
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'low-calorie', 'digestive-health']
  },

  // Vegetarian Recipes
  {
    name: 'Dhal Curry',
    mainIngredient: 'Red Lentils',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Garlic', 'Curry Leaves'],
    instructions: 'Cook red lentils until soft. Heat oil, add curry leaves, onion, and garlic. Add cooked dhal, coconut milk, curry powder, and turmeric. Simmer.',
    nutrition: {
      calories: 120,
      carbohydrates: 20,
      proteins: 7,
      fat: 2,
      fiber: 8
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'fiber-rich']
  },
  {
    name: 'Polos Curry',
    mainIngredient: 'Young Jackfruit',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Garlic', 'Ginger', 'Cinnamon'],
    instructions: 'Boil young jackfruit until tender. In a pan, sauté onion, garlic, ginger. Add curry powder, turmeric, cinnamon. Add jackfruit and coconut milk. Simmer.',
    nutrition: {
      calories: 110,
      carbohydrates: 22,
      proteins: 3,
      fat: 2,
      fiber: 4
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'low-fat', 'heart-healthy']
  },
  {
    name: 'Cucumber Curry',
    mainIngredient: 'Cucumber',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Mustard Seeds', 'Curry Leaves', 'Onion'],
    instructions: 'Cut cucumber into pieces. Heat oil, add mustard seeds and curry leaves. Add onion, curry powder, turmeric. Add cucumber and coconut milk. Cook until tender.',
    nutrition: {
      calories: 42,
      carbohydrates: 6,
      proteins: 1,
      fat: 1,
      fiber: 1
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'low-calorie', 'hydrating']
  },
  {
    name: 'Beetroot Curry',
    mainIngredient: 'Beetroot',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Curry Leaves'],
    instructions: 'Peel and cube beetroot. Sauté with onion and curry leaves. Add curry powder, turmeric, and coconut milk. Simmer until beetroot is tender.',
    nutrition: {
      calories: 58,
      carbohydrates: 12,
      proteins: 2,
      fat: 1,
      fiber: 3
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'antioxidant-rich', 'heart-healthy']
  },
  {
    name: 'Pumpkin Curry',
    mainIngredient: 'Pumpkin',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Curry Leaves', 'Cinnamon'],
    instructions: 'Cut pumpkin into cubes. Sauté with onion, curry leaves, and cinnamon. Add curry powder, turmeric, and coconut milk. Cook until pumpkin is soft.',
    nutrition: {
      calories: 52,
      carbohydrates: 11,
      proteins: 1,
      fat: 1,
      fiber: 2
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'low-calorie', 'beta-carotene-rich']
  },
  {
    name: 'Carrot Curry',
    mainIngredient: 'Carrot',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Curry Leaves'],
    instructions: 'Slice carrots. Sauté with onion and curry leaves. Add curry powder, turmeric, and coconut milk. Cook until carrots are tender but not mushy.',
    nutrition: {
      calories: 48,
      carbohydrates: 10,
      proteins: 1,
      fat: 1,
      fiber: 3
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'vitamin-a-rich', 'low-calorie']
  },
  {
    name: 'Green Bean Curry',
    mainIngredient: 'Green Beans',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Curry Leaves', 'Mustard Seeds'],
    instructions: 'Cut beans into pieces. Heat oil, add mustard seeds and curry leaves. Add onion, beans, curry powder, and turmeric. Add coconut milk and cook.',
    nutrition: {
      calories: 55,
      carbohydrates: 9,
      proteins: 3,
      fat: 1,
      fiber: 4
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'fiber-rich', 'low-fat']
  },

  // Non-Vegetarian Recipes
  {
    name: 'Fish Curry (Healthy Style)',
    mainIngredient: 'Fish',
    otherIngredients: ['Coconut Milk', 'Turmeric', 'Curry Powder', 'Onion', 'Garlic', 'Ginger', 'Curry Leaves'],
    instructions: 'Marinate fish with turmeric and salt. Sauté onion, garlic, ginger, and curry leaves. Add curry powder, turmeric, and coconut milk. Add fish and cook gently.',
    nutrition: {
      calories: 185,
      carbohydrates: 5,
      proteins: 22,
      fat: 8,
      fiber: 1
    },
    dietaryType: 'non-vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'omega-3-rich']
  },
  {
    name: 'Chicken Curry (Low Fat)',
    mainIngredient: 'Chicken',
    otherIngredients: ['Curry Powder', 'Turmeric', 'Onion', 'Garlic', 'Ginger', 'Curry Leaves', 'Coconut Milk'],
    instructions: 'Sauté chicken pieces with onion, garlic, and ginger. Add curry powder, turmeric, and curry leaves. Add coconut milk and simmer until chicken is cooked.',
    nutrition: {
      calories: 195,
      carbohydrates: 6,
      proteins: 24,
      fat: 7,
      fiber: 1
    },
    dietaryType: 'non-vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'low-fat']
  },
  {
    name: 'Prawn Curry',
    mainIngredient: 'Prawns',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Garlic', 'Ginger', 'Curry Leaves'],
    instructions: 'Clean prawns. Sauté with onion, garlic, ginger, and curry leaves. Add curry powder, turmeric, and coconut milk. Cook until prawns are done.',
    nutrition: {
      calories: 145,
      carbohydrates: 4,
      proteins: 20,
      fat: 5,
      fiber: 0
    },
    dietaryType: 'non-vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'low-calorie']
  },
  {
    name: 'Egg Curry',
    mainIngredient: 'Eggs',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Curry Leaves'],
    instructions: 'Hard boil eggs and peel. Sauté with onion and curry leaves. Add curry powder, turmeric, and coconut milk. Simmer for 5 minutes.',
    nutrition: {
      calories: 165,
      carbohydrates: 5,
      proteins: 12,
      fat: 10,
      fiber: 1
    },
    dietaryType: 'non-vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'nutritious']
  },
  {
    name: 'Chicken Kottu Roti (Healthy)',
    mainIngredient: 'Chicken',
    otherIngredients: ['Roti', 'Vegetables', 'Curry Powder', 'Turmeric', 'Onion', 'Carrot', 'Cabbage'],
    instructions: 'Shred roti. Sauté chicken with vegetables and curry powder. Add shredded roti and mix well. Cook until everything is combined.',
    nutrition: {
      calories: 285,
      carbohydrates: 35,
      proteins: 20,
      fat: 8,
      fiber: 4
    },
    dietaryType: 'non-vegetarian',
    tags: ['traditional', 'healthy', 'balanced-meal', 'fiber-rich']
  },

  // More Vegan Recipes
  {
    name: 'Kiri Hodi (Coconut Gravy)',
    mainIngredient: 'Coconut Milk',
    otherIngredients: ['Turmeric', 'Cumin', 'Fenugreek', 'Curry Leaves', 'Pandan Leaves'],
    instructions: 'Mix coconut milk with turmeric, cumin, fenugreek, curry leaves, and pandan leaves. Heat gently until flavors blend. Serve with rice.',
    nutrition: {
      calories: 85,
      carbohydrates: 4,
      proteins: 1,
      fat: 8,
      fiber: 1
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'comfort-food', 'digestive-health']
  },
  {
    name: 'Mallung (Mixed Greens)',
    mainIngredient: 'Various Leafy Greens',
    otherIngredients: ['Coconut', 'Lime', 'Green Chili', 'Red Onion', 'Turmeric'],
    instructions: 'Finely chop leafy greens. Mix with grated coconut, lime juice, chopped green chili, onion, and turmeric. Serve fresh as a side dish.',
    nutrition: {
      calories: 38,
      carbohydrates: 6,
      proteins: 2,
      fat: 1,
      fiber: 3
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'antioxidant-rich', 'iron-rich']
  },
  {
    name: 'Papadam Curry',
    mainIngredient: 'Papadam',
    otherIngredients: ['Coconut Milk', 'Turmeric', 'Onion', 'Curry Leaves', 'Mustard Seeds'],
    instructions: 'Soak papadam in water briefly. Heat oil, add mustard seeds and curry leaves. Add onion, turmeric, coconut milk, and papadam. Cook until soft.',
    nutrition: {
      calories: 95,
      carbohydrates: 12,
      proteins: 4,
      fat: 3,
      fiber: 2
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'crispy', 'protein-rich']
  },
  {
    name: 'Brinjal Moju',
    mainIngredient: 'Eggplant',
    otherIngredients: ['Vinegar', 'Sugar', 'Turmeric', 'Chili Powder', 'Mustard', 'Onion'],
    instructions: 'Slice and fry eggplant until golden. Make a sauce with vinegar, sugar, turmeric, chili powder, and mustard. Mix with eggplant and onions.',
    nutrition: {
      calories: 58,
      carbohydrates: 12,
      proteins: 1,
      fat: 1,
      fiber: 3
    },
    dietaryType: 'vegan',
    tags: ['traditional', 'healthy', 'tangy', 'low-fat']
  },

  // More Vegetarian Recipes
  {
    name: 'Lunu Miris (Traditional Salsa)',
    mainIngredient: 'Red Chili',
    otherIngredients: ['Red Onion', 'Lime', 'Salt', 'Maldive Fish (optional for veg)'],
    instructions: 'Pound red chili, onion, and salt together. Add lime juice. Mix well. Can be made without maldive fish for vegetarian version.',
    nutrition: {
      calories: 25,
      carbohydrates: 6,
      proteins: 1,
      fat: 0,
      fiber: 1
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'spicy', 'low-calorie']
  },
  {
    name: 'Cashew Curry',
    mainIngredient: 'Cashew Nuts',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Curry Leaves'],
    instructions: 'Soak cashews overnight. Sauté with onion and curry leaves. Add curry powder, turmeric, and coconut milk. Simmer until cashews are tender.',
    nutrition: {
      calories: 185,
      carbohydrates: 12,
      proteins: 6,
      fat: 14,
      fiber: 2
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'nutritious']
  },
  {
    name: 'Tempered Dhal',
    mainIngredient: 'Yellow Lentils',
    otherIngredients: ['Mustard Seeds', 'Curry Leaves', 'Dried Chili', 'Onion', 'Turmeric'],
    instructions: 'Cook lentils until soft. Heat oil, temper with mustard seeds, curry leaves, and dried chili. Add to cooked dhal with turmeric and salt.',
    nutrition: {
      calories: 110,
      carbohydrates: 18,
      proteins: 7,
      fat: 2,
      fiber: 7
    },
    dietaryType: 'vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'digestive-health']
  },

  // More Non-Vegetarian Recipes
  {
    name: 'Crab Curry',
    mainIngredient: 'Crab',
    otherIngredients: ['Coconut Milk', 'Curry Powder', 'Turmeric', 'Onion', 'Garlic', 'Ginger', 'Curry Leaves'],
    instructions: 'Clean and break crab. Sauté with onion, garlic, ginger, and curry leaves. Add curry powder, turmeric, and coconut milk. Simmer until cooked.',
    nutrition: {
      calories: 155,
      carbohydrates: 4,
      proteins: 21,
      fat: 6,
      fiber: 0
    },
    dietaryType: 'non-vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'low-carb']
  },
  {
    name: 'Chicken Devilled (Healthy)',
    mainIngredient: 'Chicken',
    otherIngredients: ['Onion', 'Bell Pepper', 'Tomato', 'Curry Powder', 'Turmeric', 'Soy Sauce', 'Lime'],
    instructions: 'Marinate chicken pieces. Stir-fry with vegetables. Add curry powder, turmeric, soy sauce, and lime. Cook until chicken is done.',
    nutrition: {
      calories: 205,
      carbohydrates: 8,
      proteins: 26,
      fat: 7,
      fiber: 2
    },
    dietaryType: 'non-vegetarian',
    tags: ['traditional', 'healthy', 'protein-rich', 'vitamin-rich']
  }
];

const seedHealthyRecipes = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI or MONGO_URI not found in environment variables');
      console.error('Please ensure .env file exists in the Server directory with MONGODB_URI set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');

    // Clear existing recipes (optional - remove if you want to keep existing)
    // await Recipe.deleteMany({});

    // Add dietary type to existing recipes without it
    await Recipe.updateMany(
      { dietaryType: { $exists: false } },
      { $set: { dietaryType: 'vegetarian' } } // Default to vegetarian for existing recipes
    );

    // Remove street food recipes
    await Recipe.deleteMany({
      tags: { $in: ['street-food', 'street food', 'fast-food', 'fast food'] }
    });

    // Insert new healthy recipes
    const inserted = await Recipe.insertMany(healthyRecipes);
    console.log(`${inserted.length} healthy recipes added successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding recipes:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedHealthyRecipes();
}

module.exports = seedHealthyRecipes;

