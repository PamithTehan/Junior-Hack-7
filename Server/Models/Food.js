const mongoose = require('mongoose');

const nameSchema = new mongoose.Schema({
  en: { type: String, required: true },
  si: { type: String },
  ta: { type: String },
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true, default: 0 }, // in grams
  carbohydrates: { type: Number, required: true, default: 0 }, // in grams
  fat: { type: Number, required: true, default: 0 }, // in grams
  fiber: { type: Number, required: true, default: 0 }, // in grams
}, { _id: false });

const foodSchema = new mongoose.Schema({
  name: {
    type: nameSchema,
    required: [true, 'Food name is required'],
  },
  type: {
    type: String,
    required: [true, 'Food type is required'],
    enum: [
      'fruits',
      'vegetables',
      'grains',
      'proteins',
      'dairy',
      'beverages',
      'nuts-seeds',
      'legumes',
      'herbs',
      'other'
    ],
  },
  nutrition: {
    type: nutritionSchema,
    required: [true, 'Nutrition information is required'],
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
  isApproved: {
    type: Boolean,
    default: true,
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
foodSchema.index({ 'name.en': 'text', 'name.si': 'text', 'name.ta': 'text' });
foodSchema.index({ type: 1 });
foodSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Food', foodSchema);

