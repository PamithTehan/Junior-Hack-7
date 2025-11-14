const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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
  adminId: {
    type: String,
    unique: true,
    sparse: true,
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
  role: {
    type: String,
    enum: ['admin', 'master'],
    default: 'admin',
  },
}, {
  timestamps: true,
});

// Generate admin ID before saving (only for new admins)
adminSchema.pre('save', async function(next) {
  if (this.isNew && !this.adminId) {
    // Generate 8-digit admin ID in format AD1-0000 0000
    const count = await mongoose.model('Admin').countDocuments();
    const paddedNumber = String(count + 1).padStart(8, '0');
    this.adminId = `AD1-${paddedNumber.slice(0, 4)} ${paddedNumber.slice(4)}`;
  }
  next();
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);

