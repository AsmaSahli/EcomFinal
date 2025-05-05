const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ReviewsController');

// Review CRUD operations
router.post('/', reviewController.createReview); // Create a review
router.get('/product/:productId/seller/:sellerId', reviewController.getReviewsByProductAndSeller); // Get reviews for a product and seller
router.put('/:reviewId', reviewController.updateReview); // Update a review
router.delete('/:reviewId', reviewController.deleteReview); // Delete a review

module.exports = router;