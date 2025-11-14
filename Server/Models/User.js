const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const healthProfileSchema = new mongoose.Schema({
  age: { type: Number },
  weight: { type: Number }, // in kg
  height: { type: Number }, // in cm
  bmi: { type: Number },
  healthConditions: [{ type: String }], // ['diabetes', 'obesity', 'heart_disease']
  goals: [{ type: String }], // ['lose_weight', 'gain_weight', 'manage_diabetes', 'heart_health']
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
  dailyCalorieGoal: { type: Number },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  healthProfile: {
    type: healthProfileSchema,
    default: {},
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Calculate BMI before saving
userSchema.pre('save', function(next) {
  if (this.healthProfile.weight && this.healthProfile.height) {
    const heightInMeters = this.healthProfile.height / 100;
    this.healthProfile.bmi = (
      this.healthProfile.weight / (heightInMeters * heightInMeters)
    ).toFixed(2);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

