const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const animationController = require('../controllers/animationController');

router.post('/', authMiddleware, animationController.createAnimation);
router.get('/:id', authMiddleware, animationController.getAnimation);
router.get('/', authMiddleware, animationController.listAnimations);

module.exports = router;
