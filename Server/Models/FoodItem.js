const mongoose = require('mongoose');

const nameSchema = new mongoose.Schema({
  en: { type: String, required: true },
  si: { type: String },
  ta: { type: String },
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 }, // in grams
  carbs: { type: Number, default: 0 }, // in grams
  fat: { type: Number, default: 0 }, // in grams
  fiber: { type: Number, default: 0 }, // in grams
  sugar: { type: Number, default: 0 }, // in grams
  sodium: { type: Number, default: 0 }, // in mg
}, { _id: false });

const foodItemSchema = new mongoose.Schema({
  name: {
    type: nameSchema,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
    enum: ['rice', 'curry', 'dessert', 'snack', 'beverage', 'bread', 'other'],
  },
  nutrition: {
    type: nutritionSchema,
    required: true,
  },
  servingSize: {
    type: String,
    required: true,
    default: '100g',
  },
  image: {
    type: String,
    default: null,
  },
  cloudinaryId: {
    type: String,
    default: null,
  },
  isTraditional: {
    type: Boolean,
    default: true,
  },
  tags: [{ type: String }], // ['diabetes-friendly', 'heart-healthy', 'low-calorie']
}, {
  timestamps: true,
});

// Index for search
foodItemSchema.index({ 'name.en': 'text', 'name.si': 'text', 'name.ta': 'text', description: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);

