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
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
  },
  name: {
    type: String,
    // Virtual field, will be computed from firstName + lastName
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
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth'],
  },
  age: {
    type: Number,
    required: [true, 'Please provide age'],
  },
  gender: {
    type: String,
    required: [true, 'Please provide gender'],
    enum: ['male', 'female', 'other'],
  },
  diabetes: {
    type: Boolean,
    default: false,
  },
  cholesterol: {
    type: Boolean,
    default: false,
  },
  otherMedicalStatus: {
    type: String,
    default: '',
  },
  medicalReports: [{
    url: String,
    cloudinaryId: String,
    fileName: String,
    fileType: String, // 'image' or 'pdf'
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
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
    enum: ['user', 'admin', 'master'],
    default: 'user',
  },
  userId: {
    type: String,
    unique: true,
    sparse: true,
  },
  dietaryPreferences: [{
    type: String,
    enum: ['vegan', 'vegetarian', 'non-vegetarian'],
  }],
}, {
  timestamps: true,
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Generate user ID before saving (only for new users)
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId && this.role === 'user') {
    // Generate 8-digit user ID in format US-0000 0000
    const count = await mongoose.model('User').countDocuments({ role: 'user' });
    const paddedNumber = String(count + 1).padStart(8, '0');
    this.userId = `US-${paddedNumber.slice(0, 4)} ${paddedNumber.slice(4)}`;
  }
  
  // Set name field
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  next();
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

