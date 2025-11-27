const express = require('express');
// const { Animation } = require('../models');
const textProcessor = require('../services/textProcessor');
const sceneGenerator = require('../services/sceneGenerator');

const router = express.Router();

// In-memory storage for demo purposes (replace with MongoDB later)
const animations = new Map();
let animationCounter = 1;

// @route   POST /api/animations/generate
// @desc    Generate animation from text description
// @access  Public (for now)
router.post('/generate', async (req, res) => {
  try {
    const { description, style = 'general', duration = 10, quality = 'preview' } = req.body;

    // Validate input
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        error: 'Description is required',
        code: 'MISSING_DESCRIPTION'
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        error: 'Description too long (max 2000 characters)',
        code: 'DESCRIPTION_TOO_LONG'
      });
    }

    // Create animation ID
    const animationId = `anim_${animationCounter++}`;

    // Create initial animation record
    const animation = {
      id: animationId,
      title: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
      description: description.trim(),
      style,
      duration: Math.min(Math.max(duration, 1), 300), // Between 1 and 300 seconds
      quality,
      status: 'processing',
      processingProgress: 0,
      instructions: {},
      scenes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    animations.set(animationId, animation);

    // Process in background (simplified for now)
    processAnimation(animationId, description, style, duration);

    res.status(201).json({
      success: true,
      data: {
        id: animation.id,
        status: animation.status,
        title: animation.title,
        description: animation.description,
        style: animation.style,
        duration: animation.duration,
        processingProgress: 0,
        previewUrl: null,
        createdAt: animation.createdAt
      },
      message: 'Animation generation started'
    });

  } catch (error) {
    console.error('Error generating animation:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'GENERATION_FAILED',
      message: error.message
    });
  }
});

// @route   GET /api/animations/:id
// @desc    Get animation by ID
// @access  Public (for now)
router.get('/:id', async (req, res) => {
  try {
    const animation = animations.get(req.params.id);

    if (!animation) {
      return res.status(404).json({
        error: 'Animation not found',
        code: 'ANIMATION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: animation
    });

  } catch (error) {
    console.error('Error fetching animation:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_FAILED'
    });
  }
});

// @route   GET /api/animations/:id/status
// @desc    Get animation processing status
// @access  Public
router.get('/:id/status', async (req, res) => {
  try {
    const animation = animations.get(req.params.id);

    if (!animation) {
      return res.status(404).json({
        error: 'Animation not found',
        code: 'ANIMATION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        id: animation.id,
        status: animation.status,
        processingProgress: animation.processingProgress,
        errorMessage: animation.errorMessage,
        lastUpdated: animation.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching animation status:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'STATUS_FETCH_FAILED'
    });
  }
});

// Background processing function (simplified)
async function processAnimation(animationId, description, style, duration) {
  try {
    const animation = animations.get(animationId);
    if (!animation) return;

    // Step 1: Parse text (20% progress)
    animation.processingProgress = 20;
    animation.status = 'processing';
    animation.updatedAt = new Date();
    const parsedData = await textProcessor.parseEducationalText(description, style);

    // Step 2: Generate scenes (60% progress)
    animation.processingProgress = 60;
    animation.updatedAt = new Date();
    const scenes = await sceneGenerator.generateScenes(parsedData, duration);

    // Step 3: Create instructions (80% progress)
    animation.processingProgress = 80;
    animation.updatedAt = new Date();
    const instructions = await sceneGenerator.createInstructions(scenes, style);

    // Step 4: Complete (100% progress)
    animation.scenes = scenes;
    animation.instructions = instructions;
    animation.status = 'completed';
    animation.processingProgress = 100;
    animation.updatedAt = new Date();

  } catch (error) {
    console.error('Error processing animation:', error);
    
    const animation = animations.get(animationId);
    if (animation) {
      animation.status = 'failed';
      animation.errorMessage = error.message;
      animation.updatedAt = new Date();
    }
  }
}

module.exports = router;