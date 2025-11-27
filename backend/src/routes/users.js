const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          usage: user.usage
        },
        token
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'REGISTRATION_FAILED'
    });
  }
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          usage: user.usage,
          lastLoginAt: user.lastLoginAt
        },
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGIN_FAILED'
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private (TODO: Add auth middleware)
router.get('/profile', async (req, res) => {
  try {
    // TODO: Extract user ID from JWT token
    // For now, this is a placeholder
    res.json({
      success: true,
      message: 'Profile endpoint - auth middleware needed',
      note: 'This endpoint will require authentication'
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'PROFILE_FETCH_FAILED'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private (TODO: Add auth middleware)
router.put('/profile', async (req, res) => {
  try {
    // TODO: Extract user ID from JWT token and update profile
    res.json({
      success: true,
      message: 'Profile update endpoint - auth middleware needed'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'PROFILE_UPDATE_FAILED'
    });
  }
});

// @route   POST /api/users/generate-api-key
// @desc    Generate API key for user
// @access  Private (TODO: Add auth middleware)
router.post('/generate-api-key', async (req, res) => {
  try {
    // TODO: Extract user ID from JWT token
    // For now, this is a placeholder
    res.json({
      success: true,
      message: 'API key generation endpoint - auth middleware needed'
    });

  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'API_KEY_GENERATION_FAILED'
    });
  }
});

module.exports = router;