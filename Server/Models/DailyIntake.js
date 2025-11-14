const mongoose = require('mongoose');

const intakeItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: false, // Optional for scanned foods
  },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true }, // serving size multiplier
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true }); // Enable _id for subdocuments so we can identify and remove them

const dailyIntakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  foods: [intakeItemSchema],
  totalCalories: {
    type: Number,
    default: 0,
  },
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Index for user and date lookup
dailyIntakeSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('DailyIntake', dailyIntakeSchema);

