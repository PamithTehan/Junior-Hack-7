const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  carbohydrates: { type: Number, required: true, default: 0 }, // in grams
  proteins: { type: Number, required: true, default: 0 }, // in grams
  fat: { type: Number, default: 0 }, // in grams
  fiber: { type: Number, default: 0 }, // in grams
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Recipe name is required'],
    trim: true,
  },
  mainIngredient: {
    type: String,
    required: [true, 'Main ingredient name is required'],
    trim: true,
  },
  otherIngredients: [{
    type: String,
    trim: true,
  }],
  instructions: {
    type: String,
    required: [true, 'Instructions are required'],
  },
  nutrition: {
    type: nutritionSchema,
    required: true,
  },
  dietaryType: {
    type: String,
    required: [true, 'Dietary type is required'],
    enum: ['vegan', 'vegetarian', 'non-vegetarian'],
    trim: true,
  },
  tags: [{ 
    type: String,
    trim: true,
  }], // Optional tags like 'traditional', 'spicy', 'healthy', 'diabetes-friendly'
}, {
  timestamps: true,
});

// Index for search
recipeSchema.index({ name: 'text', mainIngredient: 'text' });
recipeSchema.index({ tags: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
