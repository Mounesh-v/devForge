const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },
  
  // Usage Statistics
  usage: {
    animationsCreated: {
      type: Number,
      default: 0
    },
    
    animationsThisMonth: {
      type: Number,
      default: 0
    },
    
    lastResetDate: {
      type: Date,
      default: Date.now
    },
    
    totalProcessingTime: {
      type: Number,
      default: 0
    },
    
    storageUsed: {
      type: Number,
      default: 0 // in bytes
    }
  },
  
  // Subscription Information
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'professional', 'enterprise'],
      default: 'free'
    },
    
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired'],
      default: 'active'
    },
    
    startDate: {
      type: Date,
      default: Date.now
    },
    
    endDate: {
      type: Date,
      default: null
    },
    
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  
  // API Access
  apiKey: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  
  apiUsage: {
    callsThisMonth: {
      type: Number,
      default: 0
    },
    
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Preferences
  preferences: {
    defaultStyle: {
      type: String,
      enum: ['mathematical', 'physics', 'algorithmic', 'scientific', 'general'],
      default: 'general'
    },
    
    defaultQuality: {
      type: String,
      enum: ['preview', 'sd', 'hd', '4k'],
      default: 'preview'
    },
    
    emailNotifications: {
      type: Boolean,
      default: true
    },
    
    publicProfile: {
      type: Boolean,
      default: false
    }
  },
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  // Reset Password
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Email Verification
  emailVerificationToken: String,
  emailVerificationExpire: Date
  
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ apiKey: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate API key
userSchema.methods.generateApiKey = function() {
  const crypto = require('crypto');
  this.apiKey = `df_${crypto.randomBytes(32).toString('hex')}`;
  return this.apiKey;
};

// Method to check if user has reached monthly limit
userSchema.methods.hasReachedMonthlyLimit = function() {
  const limits = {
    free: 100,
    professional: 2000,
    enterprise: Infinity
  };
  
  const currentLimit = limits[this.subscription.plan] || limits.free;
  return this.usage.animationsThisMonth >= currentLimit;
};

// Method to increment usage
userSchema.methods.incrementUsage = function() {
  // Reset monthly count if it's a new month
  const now = new Date();
  const lastReset = this.usage.lastResetDate;
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.animationsThisMonth = 0;
    this.usage.lastResetDate = now;
  }
  
  this.usage.animationsCreated += 1;
  this.usage.animationsThisMonth += 1;
  
  return this.save();
};

// Method to get usage percentage
userSchema.methods.getUsagePercentage = function() {
  const limits = {
    free: 100,
    professional: 2000,
    enterprise: Infinity
  };
  
  const currentLimit = limits[this.subscription.plan] || limits.free;
  if (currentLimit === Infinity) return 0;
  
  return Math.min((this.usage.animationsThisMonth / currentLimit) * 100, 100);
};

// Virtual for full name (if we had firstName/lastName)
userSchema.virtual('initials').get(function() {
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
});

// Method to check if subscription is active
userSchema.methods.hasActiveSubscription = function() {
  if (this.subscription.plan === 'free') return true;
  
  return this.subscription.status === 'active' && 
         (!this.subscription.endDate || this.subscription.endDate > new Date());
};

// Static method to find users by plan
userSchema.statics.findByPlan = function(plan) {
  return this.find({ 'subscription.plan': plan, isActive: true });
};

module.exports = mongoose.model('User', userSchema);