const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  carbohydrates: { type: Number, required: true, default: 0 }, // in grams
  proteins: { type: Number, required: true, default: 0 }, // in grams
  fiber: { type: Number, default: 0 }, // in grams
  fat: { type: Number, default: 0 }, // in grams
}, { _id: false });

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'nuts', 'legumes', 'other'],
  },
  nutrition: {
    type: nutritionSchema,
    required: true,
  },
  tags: [{ 
    type: String,
    trim: true,
  }], // Optional tags like 'diabetes-friendly', 'heart-healthy', 'low-calorie'
}, {
  timestamps: true,
});

// Index for search
ingredientSchema.index({ name: 'text' });
ingredientSchema.index({ category: 1 });

module.exports = mongoose.model('Ingredient', ingredientSchema);



