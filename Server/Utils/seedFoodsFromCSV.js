const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FoodItem = require('../Models/FoodItem');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Category mapping from CSV sections to model categories
const categoryMap = {
  'Grains & Cereals': 'rice',
  'Legumes & Pulses': 'curry',
  'Vegetables': 'curry',
  'Fruits': 'other',
  'Proteins': 'curry',
  'Dairy & Coconut': 'other',
  'Nuts & Seeds': 'snack',
  'Spices & Herbs': 'other',
  'Sweeteners': 'other',
  'Miscellaneous': 'other', // Will be skipped during parsing
};

// Helper function to determine category from ingredient name and section
const determineCategory = (ingredient, section) => {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check for specific patterns in ingredient name
  if (lowerIngredient.includes('rice')) return 'rice';
  if (lowerIngredient.includes('bread') || lowerIngredient.includes('hoppers') || 
      lowerIngredient.includes('roti') || lowerIngredient.includes('pittu') ||
      lowerIngredient.includes('paan')) return 'bread';
  if (lowerIngredient.includes('milk') || lowerIngredient.includes('curd') || 
      lowerIngredient.includes('yogurt')) return 'beverage';
  
  // Use section-based mapping
  return categoryMap[section] || 'other';
};

// Helper function to generate tags based on nutrition and key nutrients
const generateTags = (nutrition, keyNutrients) => {
  const tags = [];
  const lowerNutrients = (keyNutrients || '').toLowerCase();
  
  // Diabetes-friendly: low carbs, high fiber
  if (nutrition.carbs < 15 || nutrition.fiber > 5) {
    tags.push('diabetes-friendly');
  }
  
  // Heart-healthy: low fat, omega-3, antioxidants
  if (nutrition.fat < 5 || lowerNutrients.includes('omega-3') || 
      lowerNutrients.includes('antioxidant') || lowerNutrients.includes('antioxidants')) {
    tags.push('heart-healthy');
  }
  
  // Low-calorie
  if (nutrition.calories < 50) {
    tags.push('low-calorie');
  }
  
  // High-protein
  if (nutrition.protein > 15) {
    tags.push('high-protein');
  }
  
  // High-fiber
  if (nutrition.fiber > 5) {
    tags.push('high-fiber');
  }
  
  return tags;
};

// Parse CSV file
const parseCSV = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    // Handle both Unix (\n) and Windows (\r\n) line endings
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
    const foods = [];
    let currentSection = '';
    
    // Skip header line (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (handling quoted values)
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value
      
      // Check if this is a section header (has first value but empty second value)
      if (values.length > 0 && values[0] && (!values[1] || values[1] === '')) {
        currentSection = values[0].trim();
        // Skip Miscellaneous section
        if (currentSection === 'Miscellaneous') {
          currentSection = ''; // Reset to skip all items in this section
        }
        continue;
      }
      
      // Skip if current section is Miscellaneous (shouldn't happen, but safety check)
      if (currentSection === 'Miscellaneous') {
        continue;
      }
      
      // Skip if not enough values or if it's a section header
      if (values.length < 6 || !values[0] || !values[1] || values[1] === '') {
        continue;
      }
      
      const ingredient = values[0].replace(/"/g, '').trim();
      const calories = parseFloat(values[1]) || 0;
      const protein = parseFloat(values[2]) || 0;
      const carbs = parseFloat(values[3]) || 0;
      const fat = parseFloat(values[4]) || 0;
      const fiber = parseFloat(values[5]) || 0;
      const keyNutrients = values[6] ? values[6].replace(/"/g, '').trim() : '';
      
      // Skip if no calories (likely a header or invalid row)
      if (calories === 0 && protein === 0 && carbs === 0) {
        continue;
      }
      
      // Determine category
      const category = determineCategory(ingredient, currentSection);
      
      // Build nutrition object
      const nutrition = {
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar: 0, // Not in CSV, default to 0
        sodium: 0, // Not in CSV, default to 0
      };
      
      // Generate tags
      const tags = generateTags(nutrition, keyNutrients);
      
      // Generate description
      const description = `${ingredient}. ${keyNutrients ? `Rich in ${keyNutrients}.` : ''} Nutritional values per 100g.`;
      
      // Extract names from parentheses (e.g., "String Hoppers (Idiyappam)")
      let enName = ingredient;
      let siName = '';
      let taName = '';
      
      const parenMatch = ingredient.match(/^(.+?)\s*\((.+?)\)$/);
      if (parenMatch) {
        enName = parenMatch[1].trim();
        const altName = parenMatch[2].trim();
        // Use alternative name as Sinhala (common pattern in CSV)
        siName = altName;
      }
      
      foods.push({
        name: {
          en: enName,
          si: siName || enName, // Use English as fallback
          ta: taName || enName, // Use English as fallback
        },
        description,
        category,
        nutrition,
        servingSize: '100g',
        isTraditional: true,
        tags,
      });
    }
    
    return foods;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

const seedFoodsFromCSV = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get CSV file path from command line argument or use default locations
    let csvFilePath = process.argv[2];
    
    if (!csvFilePath) {
      // Try multiple default locations
      const possiblePaths = [
        path.join(__dirname, '../Nutritional-Details-of-100-Sri-Lankan-Ingredients-(per-100g).csv'),
        path.join(process.cwd(), 'Nutritional-Details-of-100-Sri-Lankan-Ingredients-(per-100g).csv'),
        'c:\\Users\\pamit\\Downloads\\Nutritional-Details-of-100-Sri-Lankan-Ingredients-(per-100g).csv',
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          csvFilePath = possiblePath;
          break;
        }
      }
    }
    
    // Check if file exists
    if (!csvFilePath || !fs.existsSync(csvFilePath)) {
      console.error('CSV file not found!');
      console.error('Please provide the CSV file path as an argument:');
      console.error('  npm run seed:csv "path/to/your/file.csv"');
      console.error('Or place the CSV file in the Server directory.');
      process.exit(1);
    }

    console.log('Reading CSV file from:', csvFilePath);
    
    // Parse CSV
    const foods = parseCSV(csvFilePath);
    console.log(`Parsed ${foods.length} food items from CSV (Miscellaneous items excluded)`);

    // Clear ALL existing foods
    const deleteResult = await FoodItem.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing food items`);

    // Insert new foods from CSV
    const insertedFoods = await FoodItem.insertMany(foods);
    console.log(`Successfully seeded ${insertedFoods.length} food items from CSV`);

    // Print summary
    const categoryCount = {};
    insertedFoods.forEach(food => {
      categoryCount[food.category] = (categoryCount[food.category] || 0) + 1;
    });
    console.log('\nCategory breakdown:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} items`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding foods from CSV:', error);
    process.exit(1);
  }
};

// Run seed function
if (require.main === module) {
  seedFoodsFromCSV();
}

module.exports = seedFoodsFromCSV;
