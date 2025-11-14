const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FoodItem = require('../Models/FoodItem');

dotenv.config();

const sriLankanFoods = [
  // Rice & Curry
  {
    name: {
      en: 'Steamed Rice',
      si: 'සුදු හාල්',
      ta: 'வெள்ளை அரிசி',
    },
    description: 'Plain white rice, the staple food of Sri Lanka. Served with curry.',
    category: 'rice',
    nutrition: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.05,
      sodium: 5,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'low-fat'],
  },
  {
    name: {
      en: 'Red Rice',
      si: 'රතු හාල්',
      ta: 'சிவப்பு அரிசி',
    },
    description: 'Nutritious red rice with higher fiber content. Better for diabetes management.',
    category: 'rice',
    nutrition: {
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      sugar: 0.3,
      sodium: 4,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'heart-healthy', 'high-fiber'],
  },
  {
    name: {
      en: 'Dhal Curry',
      si: 'පරිප්පු',
      ta: 'பருப்பு கறி',
    },
    description: 'Traditional lentil curry, rich in protein and fiber. Essential part of Sri Lankan meal.',
    category: 'curry',
    nutrition: {
      calories: 116,
      protein: 9,
      carbs: 20,
      fat: 0.4,
      fiber: 7.9,
      sugar: 2.0,
      sodium: 6,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'heart-healthy', 'high-protein', 'high-fiber'],
  },
  {
    name: {
      en: 'Chicken Curry',
      si: 'කුකුල් කෑර',
      ta: 'கோழி கறி',
    },
    description: 'Spicy chicken curry cooked with coconut milk and traditional spices.',
    category: 'curry',
    nutrition: {
      calories: 239,
      protein: 27,
      carbs: 2,
      fat: 14,
      fiber: 0.5,
      sugar: 0.8,
      sodium: 400,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['high-protein'],
  },
  {
    name: {
      en: 'Fish Curry',
      si: 'මාළු කෑර',
      ta: 'மீன் கறி',
    },
    description: 'Spicy fish curry with coconut milk and tamarind. Rich in omega-3 fatty acids.',
    category: 'curry',
    nutrition: {
      calories: 206,
      protein: 22,
      carbs: 3,
      fat: 11,
      fiber: 0.3,
      sugar: 1.2,
      sodium: 350,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['heart-healthy', 'high-protein', 'omega-3'],
  },
  {
    name: {
      en: 'Pumpkin Curry',
      si: 'වටකෑක්කෑර',
      ta: 'பூசணி கறி',
    },
    description: 'Sweet pumpkin curry cooked with coconut milk. Low calorie and nutritious.',
    category: 'curry',
    nutrition: {
      calories: 45,
      protein: 1.0,
      carbs: 11,
      fat: 0.1,
      fiber: 1.5,
      sugar: 4.2,
      sodium: 6,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'low-calorie', 'heart-healthy'],
  },
  {
    name: {
      en: 'Beans Curry',
      si: 'බෝංචි කෑර',
      ta: 'பீன்ஸ் கறி',
    },
    description: 'Green beans curry with coconut milk. High in fiber and vitamins.',
    category: 'curry',
    nutrition: {
      calories: 31,
      protein: 1.8,
      carbs: 7,
      fat: 0.2,
      fiber: 2.7,
      sugar: 3.3,
      sodium: 6,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'heart-healthy', 'high-fiber', 'low-calorie'],
  },
  {
    name: {
      en: 'Okra Curry',
      si: 'බණ්ඩක්කා',
      ta: 'வெண்டைக்காய் கறி',
    },
    description: 'Ladyfinger curry cooked with spices. Good for blood sugar control.',
    category: 'curry',
    nutrition: {
      calories: 33,
      protein: 1.9,
      carbs: 7,
      fat: 0.2,
      fiber: 3.2,
      sugar: 1.5,
      sodium: 7,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'heart-healthy', 'low-calorie'],
  },
  {
    name: {
      en: 'Eggplant Curry',
      si: 'වම්බටු කෑර',
      ta: 'கத்தரிக்காய் கறி',
    },
    description: 'Brinjal curry with coconut milk and spices. Low calorie vegetable curry.',
    category: 'curry',
    nutrition: {
      calories: 35,
      protein: 1.0,
      carbs: 9,
      fat: 0.2,
      fiber: 3.0,
      sugar: 3.5,
      sodium: 2,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'low-calorie'],
  },

  // Breads
  {
    name: {
      en: 'Hopper (Appa)',
      si: 'ආප්ප',
      ta: 'அப்பம்',
    },
    description: 'Traditional Sri Lankan fermented rice pancake, bowl-shaped. Served with curry or egg.',
    category: 'bread',
    nutrition: {
      calories: 155,
      protein: 3.0,
      carbs: 32,
      fat: 0.8,
      fiber: 0.9,
      sugar: 0.1,
      sodium: 5,
    },
    servingSize: '1 piece',
    isTraditional: true,
    tags: ['diabetes-friendly', 'traditional'],
  },
  {
    name: {
      en: 'String Hoppers',
      si: 'ඉඳිආප්ප',
      ta: 'இடியாப்பம்',
    },
    description: 'Steamed rice noodle pancakes. Lighter than regular hoppers.',
    category: 'bread',
    nutrition: {
      calories: 82,
      protein: 1.5,
      carbs: 18,
      fat: 0.2,
      fiber: 0.5,
      sugar: 0.05,
      sodium: 3,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'low-calorie', 'traditional'],
  },
  {
    name: {
      en: 'Roti',
      si: 'රොටි',
      ta: 'ரொட்டி',
    },
    description: 'Flatbread made from wheat flour, often served with curry.',
    category: 'bread',
    nutrition: {
      calories: 264,
      protein: 9.2,
      carbs: 52,
      fat: 2.5,
      fiber: 2.7,
      sugar: 0.5,
      sodium: 536,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['high-carb'],
  },
  {
    name: {
      en: 'Kottu Roti',
      si: 'කොත්තු රොටි',
      ta: 'கொத்து ரொட்டி',
    },
    description: 'Chopped roti stir-fried with vegetables, meat or egg. Popular street food.',
    category: 'bread',
    nutrition: {
      calories: 189,
      protein: 6.8,
      carbs: 28,
      fat: 5.5,
      fiber: 2.1,
      sugar: 3.2,
      sodium: 420,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: [],
  },

  // Sambol & Sides
  {
    name: {
      en: 'Pol Sambol',
      si: 'පොල් සම්බෝල',
      ta: 'தேங்காய் சம்பல்',
    },
    description: 'Spicy coconut sambol with chili, lime, and onions. High in healthy fats.',
    category: 'snack',
    nutrition: {
      calories: 354,
      protein: 3.3,
      carbs: 6.2,
      fat: 36,
      fiber: 9.0,
      sugar: 2.8,
      sodium: 15,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['heart-healthy'],
  },
  {
    name: {
      en: 'Lunu Miris',
      si: 'ලුණු මිරිස්',
      ta: 'உப்பு மிளகாய்',
    },
    description: 'Spicy onion and chili sambol. Very low calorie but spicy.',
    category: 'snack',
    nutrition: {
      calories: 40,
      protein: 1.2,
      carbs: 9,
      fat: 0.1,
      fiber: 1.7,
      sugar: 4.2,
      sodium: 4,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['low-calorie', 'diabetes-friendly'],
  },

  // Fruits & Vegetables
  {
    name: {
      en: 'Jackfruit',
      si: 'කොස්',
      ta: 'பலா',
    },
    description: 'Sweet tropical fruit, rich in fiber and vitamins. Can be eaten ripe or cooked as curry.',
    category: 'other',
    nutrition: {
      calories: 95,
      protein: 1.7,
      carbs: 24,
      fat: 0.6,
      fiber: 1.5,
      sugar: 19,
      sodium: 2,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['high-fiber', 'diabetes-friendly'],
  },
  {
    name: {
      en: 'King Coconut (Thambili)',
      si: 'තැඹිලි',
      ta: 'தென்னை',
    },
    description: 'Refreshing coconut water. Natural electrolyte drink, low in calories.',
    category: 'beverage',
    nutrition: {
      calories: 19,
      protein: 0.7,
      carbs: 3.7,
      fat: 0.2,
      fiber: 1.1,
      sugar: 2.6,
      sodium: 105,
    },
    servingSize: '100ml',
    isTraditional: true,
    tags: ['low-calorie', 'diabetes-friendly', 'heart-healthy'],
  },
  {
    name: {
      en: 'Coconut Sambol',
      si: 'කොහොඹ කෑර',
      ta: 'கொத்துமல்லி சம்பல்',
    },
    description: 'Fresh coconut with chili, onion, and lime. Refreshing side dish.',
    category: 'snack',
    nutrition: {
      calories: 354,
      protein: 3.3,
      carbs: 15,
      fat: 33,
      fiber: 9.0,
      sugar: 6.2,
      sodium: 20,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['heart-healthy'],
  },

  // Desserts
  {
    name: {
      en: 'Kiribath (Milk Rice)',
      si: 'කිරිබත්',
      ta: 'பால் சாதம்',
    },
    description: 'Coconut milk rice cooked to creamy consistency. Traditional festive dish.',
    category: 'rice',
    nutrition: {
      calories: 181,
      protein: 3.1,
      carbs: 28,
      fat: 6.5,
      fiber: 0.8,
      sugar: 0.2,
      sodium: 8,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['traditional'],
  },
  {
    name: {
      en: 'Pittu',
      si: 'පිට්ටු',
      ta: 'பிட்டு',
    },
    description: 'Steamed cylinders of rice flour and coconut. Served with curry or banana.',
    category: 'bread',
    nutrition: {
      calories: 168,
      protein: 3.5,
      carbs: 28,
      fat: 4.8,
      fiber: 1.5,
      sugar: 0.3,
      sodium: 5,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['traditional', 'diabetes-friendly'],
  },

  // Additional Items
  {
    name: {
      en: 'Gotu Kola Sambol',
      si: 'ගොටු කොළ සම්බෝල',
      ta: 'வல்லாரை சம்பல்',
    },
    description: 'Fresh gotu kola leaves mixed with coconut, lime, and spices. Medicinal properties.',
    category: 'snack',
    nutrition: {
      calories: 45,
      protein: 1.8,
      carbs: 6,
      fat: 1.8,
      fiber: 2.2,
      sugar: 2.1,
      sodium: 15,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['heart-healthy', 'low-calorie', 'medicinal'],
  },
  {
    name: {
      en: 'Mallum',
      si: 'මල්ලුම්',
      ta: 'மல்லும்',
    },
    description: 'Stir-fried leafy greens with coconut and spices. Very nutritious and low calorie.',
    category: 'curry',
    nutrition: {
      calories: 58,
      protein: 2.3,
      carbs: 5,
      fat: 3.5,
      fiber: 2.8,
      sugar: 1.8,
      sodium: 12,
    },
    servingSize: '100g',
    isTraditional: true,
    tags: ['diabetes-friendly', 'heart-healthy', 'low-calorie', 'high-fiber'],
  },
];

const seedFoods = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing foods
    await FoodItem.deleteMany({});
    console.log('Cleared existing food items');

    // Insert new foods
    const foods = await FoodItem.insertMany(sriLankanFoods);
    console.log(`Seeded ${foods.length} food items successfully`);

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

