const express = require('express');
const router = express.Router();
const { createPromotion, getUserPromotions } = require('../controllers/promotionController');

// Create promotion with image upload
router.post('/', createPromotion);

// Get all promotions for a specific user
router.get('/:userId', getUserPromotions);

module.exports = router;