const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Please provide article topic'],
    trim: true,
  },
  body: {
    type: String,
    required: [true, 'Please provide article body'],
    trim: true,
  },
  summary: {
    type: String,
    default: '',
    trim: true,
  },
  photo: {
    type: String,
    default: null,
  },
  photoCloudinaryId: {
    type: String,
    default: null,
  },
  video: {
    type: String,
    default: null,
  },
  videoCloudinaryId: {
    type: String,
    default: null,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  lastEditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  lastEditorName: {
    type: String,
    default: null,
  },
  isApproved: {
    type: Boolean,
    default: false, // User articles need approval
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
  isEdited: {
    type: Boolean,
    default: false,
  },
  editRequests: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    reason: String,
    approved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  viewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for search
articleSchema.index({ topic: 'text', body: 'text', summary: 'text' });

// Generate summary from body if not provided
articleSchema.pre('save', function(next) {
  if (!this.summary && this.body) {
    // Create a summary from first 150 characters of body
    this.summary = this.body.substring(0, 150).trim();
    if (this.body.length > 150) {
      this.summary += '...';
    }
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);

