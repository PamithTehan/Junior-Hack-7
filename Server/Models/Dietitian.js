const mongoose = require('mongoose');

const dietitianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide dietitian name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true,
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide contact number'],
    trim: true,
  },
  contactInfo: {
    type: String,
    default: '',
    trim: true,
  },
  photo: {
    type: String,
    default: null,
  },
  cloudinaryId: {
    type: String,
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

module.exports = mongoose.model('Dietitian', dietitianSchema);

