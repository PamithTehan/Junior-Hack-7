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
    unique: [true, 'An account with this email already exists'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true, // Ensure index is created
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
    // Age will be calculated from dateOfBirth
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
    unique: [true, 'User ID must be unique'],
    sparse: true,
    index: true,
  },
  dietaryPreferences: [{
    type: String,
    enum: ['vegan', 'vegetarian', 'non-vegetarian'],
  }],
  // Manual nutrition goals set by user in Daily Tracker
  manualNutritionGoals: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    fiber: { type: Number },
    useManual: { type: Boolean, default: false }, // Flag to indicate if manual goals should be used
  },
}, {
  timestamps: true,
});

// Ensure unique indexes are created (MongoDB best practice)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userId: 1 }, { unique: true, sparse: true });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Generate user ID before saving (only for new users)
userSchema.pre('save', async function(next) {
  try {
    // Always set name field
    if (this.firstName && this.lastName) {
      this.name = `${this.firstName} ${this.lastName}`;
    }
    
    // Skip userId generation if document is not new or already has userId
    if (!this.isNew || this.userId) {
      return next();
    }
    
    // Generate user ID only for new users without userId and role is 'user'
    if (this.role === 'user' || !this.role) {
      try {
        // Use this.constructor to get the model (safe for pre-save hooks)
        const UserModel = this.constructor;
        if (UserModel && typeof UserModel.countDocuments === 'function') {
          // Get the maximum userId number to avoid race conditions
          const users = await UserModel.find({ 
            role: 'user',
            userId: { $exists: true, $ne: null }
          }).select('userId').sort({ userId: -1 }).limit(1);
          
          let nextNumber = 1;
          if (users.length > 0 && users[0].userId) {
            // Extract number from existing userId (format: US-0000 0003)
            const userIdMatch = users[0].userId.match(/(\d+)/g);
            if (userIdMatch && userIdMatch.length > 0) {
              const lastNumber = parseInt(userIdMatch.join(''), 10);
              nextNumber = lastNumber + 1;
            }
          } else {
            // If no users found, count total users
            const count = await UserModel.countDocuments({ role: 'user' });
            nextNumber = count + 1;
          }
          
          // Add timestamp and random component to handle concurrent requests
          // This ensures uniqueness even with simultaneous registrations
          const timestamp = Date.now().toString().slice(-6); // Last 6 digits
          const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
          const paddedNumber = String(nextNumber).padStart(4, '0');
          // Format: US-XXXX YYYY where XXXX is the sequence number and YYYY is timestamp + random
          this.userId = `US-${paddedNumber} ${timestamp.slice(0, 2)}${random}`;
        } else {
          // Fallback if model is not available
          const timestamp = Date.now().toString().slice(-8);
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          this.userId = `US-${timestamp.slice(0, 4)} ${random}`;
        }
      } catch (countError) {
        // If count fails, generate a simple ID based on timestamp and random
        console.error('Error generating userId:', countError);
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.userId = `US-${timestamp.slice(0, 4)} ${random}`;
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in user pre-save hook:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    // Don't block save if userId generation fails - let it use default
    next();
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Calculate age from dateOfBirth and BMI before saving (runs after other pre-save hooks)
userSchema.pre('save', function(next) {
  try {
    // Ensure healthProfile exists as an object
    if (!this.healthProfile || typeof this.healthProfile !== 'object') {
      this.healthProfile = {};
    }
    
    // Calculate age from dateOfBirth
    if (this.dateOfBirth) {
      try {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        
        // Validate date
        if (isNaN(birthDate.getTime())) {
          console.warn('Invalid dateOfBirth provided:', this.dateOfBirth);
        } else {
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          // Ensure age is positive
          if (age > 0 && age < 150) {
            this.age = age;
            this.healthProfile.age = age;
          }
        }
      } catch (dateError) {
        console.error('Error calculating age:', dateError);
        // Continue even if age calculation fails
      }
    }
    
    // Calculate BMI from weight and height
    const weight = this.healthProfile?.weight;
    const height = this.healthProfile?.height;
    
    if (weight && height && !isNaN(weight) && !isNaN(height) && weight > 0 && height > 0) {
      try {
        const heightInMeters = height / 100;
        if (heightInMeters > 0) {
          const bmi = weight / (heightInMeters * heightInMeters);
          if (bmi > 0 && bmi < 100) {
            this.healthProfile.bmi = parseFloat(bmi.toFixed(2));
          }
        }
      } catch (bmiError) {
        console.error('Error calculating BMI:', bmiError);
        // Continue even if BMI calculation fails
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in age/BMI calculation pre-save hook:', error);
    console.error('Error stack:', error.stack);
    // Don't block save if age/BMI calculation fails
    next();
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

