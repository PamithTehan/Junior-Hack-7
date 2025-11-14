const mongoose = require('mongoose');

const nameSchema = new mongoose.Schema({
  en: { type: String, required: true },
  si: { type: String },
  ta: { type: String },
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  name: {
    type: nameSchema,
    required: [true, 'Recipe name is required'],
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['rice', 'curry', 'dessert', 'snack', 'beverage', 'bread', 'other'],
    default: 'other',
  },
  ingredients: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: 'g',
    },
  }],
  instructions: [{
    step: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  }],
  servings: {
    type: Number,
    default: 1,
  },
  prepTime: {
    type: Number, // in minutes
    default: 0,
  },
  cookTime: {
    type: Number, // in minutes
    default: 0,
  },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  image: {
    type: String,
    default: null,
  },
  cloudinaryId: {
    type: String,
    default: null,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Index for search
recipeSchema.index({ 'name.en': 'text', 'name.si': 'text', 'name.ta': 'text', description: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);

