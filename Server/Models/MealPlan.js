const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true,
  },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true }, // serving size multiplier
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  items: [mealItemSchema],
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  meals: [mealSchema],
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Index for user and date lookup
mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);

