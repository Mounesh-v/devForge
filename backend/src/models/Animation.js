const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0.1,
    max: 60
  },
  startTime: {
    type: Number,
    required: true,
    min: 0
  },
  objects: [{
    id: String,
    type: {
      type: String,
      enum: ['text', 'shape', 'line', 'arrow', 'graph', 'equation', 'image']
    },
    properties: mongoose.Schema.Types.Mixed,
    animations: [{
      property: String,
      from: mongoose.Schema.Types.Mixed,
      to: mongoose.Schema.Types.Mixed,
      duration: Number,
      easing: {
        type: String,
        default: 'ease-in-out'
      },
      delay: {
        type: Number,
        default: 0
      }
    }]
  }],
  metadata: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    dimensions: {
      width: {
        type: Number,
        default: 1920
      },
      height: {
        type: Number,
        default: 1080
      }
    }
  }
});

const animationSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous users for now
  },
  
  // Animation Configuration
  style: {
    type: String,
    required: true,
    enum: ['mathematical', 'physics', 'algorithmic', 'scientific', 'general'],
    default: 'general'
  },
  
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 300, // 5 minutes max
    default: 10
  },
  
  quality: {
    type: String,
    enum: ['preview', 'sd', 'hd', '4k'],
    default: 'preview'
  },
  
  // Generated Content
  scenes: [sceneSchema],
  
  instructions: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Processing Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  processingProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  errorMessage: {
    type: String,
    default: null
  },
  
  // File Information
  previewUrl: String,
  videoUrl: String,
  thumbnailUrl: String,
  
  fileSize: {
    type: Number,
    default: 0
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  downloads: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Export Information
  exports: [{
    format: {
      type: String,
      enum: ['mp4', 'webm', 'gif', 'png_sequence']
    },
    quality: String,
    url: String,
    fileSize: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
animationSchema.index({ userId: 1, createdAt: -1 });
animationSchema.index({ status: 1 });
animationSchema.index({ style: 1 });
animationSchema.index({ isPublic: 1, createdAt: -1 });
animationSchema.index({ tags: 1 });

// Virtual for formatted duration
animationSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
});

// Method to update processing progress
animationSchema.methods.updateProgress = function(progress, status = null) {
  this.processingProgress = progress;
  if (status) {
    this.status = status;
  }
  return this.save();
};

// Method to add export
animationSchema.methods.addExport = function(exportData) {
  this.exports.push(exportData);
  return this.save();
};

// Static method to find by user
animationSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find public animations
animationSchema.statics.findPublic = function(limit = 20) {
  return this.find({ isPublic: true, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-instructions'); // Don't return instructions for public listings
};

module.exports = mongoose.model('Animation', animationSchema);