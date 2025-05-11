const mongoose = require('mongoose');
const Review = require('../models/Review'); // Adjust path to your Review model
const Product = require('../models/Product'); // Adjust path to your Product model

// Add a new review for a product by a specific seller
exports.addReview = async (req, res) => {
  try {
    const { productId, sellerId, userId, rating, comment } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(sellerId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid product, seller, or user ID' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (comment && comment.length > 500) {
      return res.status(400).json({ message: 'Comment cannot exceed 500 characters' });
    }

    // Check if product and seller exist
    const product = await Product.findOne({
      _id: productId,
      'sellers.sellerId': sellerId
    });
    if (!product) {
      return res.status(404).json({ message: 'Product or seller not found' });
    }

    // Check if user already reviewed this product-seller combination
    const existingReview = await Review.findOne({
      product: productId,
      seller: sellerId,
      user: userId
    });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product from this seller' });
    }

    // Create new review
    const review = new Review({
      product: productId,
      seller: sellerId,
      user: userId,
      rating,
      comment
    });

    // Save review
    await review.save();

    // Add review to product's seller-specific reviews array
    await Product.updateOne(
      { _id: productId, 'sellers.sellerId': sellerId },
      { $push: { 'sellers.$.reviews': review._id } }
    );

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reviews for a product by a specific seller
exports.getReviewsByProductAndSeller = async (req, res) => {
  try {
    const { productId, sellerId } = req.params;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: 'Invalid product or seller ID' });
    }

    // Check if product and seller exist
    const product = await Product.findOne({
      _id: productId,
      'sellers.sellerId': sellerId
    });
    if (!product) {
      return res.status(404).json({ message: 'Product or seller not found' });
    }

    // Find reviews
    const reviews = await Review.find({
      product: productId,
      seller: sellerId
    })
      .populate('user', 'name email') // Populate user details (adjust fields as needed)
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a review for a product by a specific seller
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, rating, comment } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid review or user ID' });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (comment && comment.length > 500) {
      return res.status(400).json({ message: 'Comment cannot exceed 500 characters' });
    }

    // Find review
    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or you are not authorized to update it' });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment; // Allow empty comment
    review.updatedAt = Date.now();

    // Save updated review
    await review.save();

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a review for a product by a specific seller
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId, userId } = req.params;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid review or user ID' });
    }

    // Find review
    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or you are not authorized to delete it' });
    }

    // Remove review from product's seller-specific reviews array
    await Product.updateOne(
      { _id: review.product, 'sellers.sellerId': review.seller },
      { $pull: { 'sellers.$.reviews': reviewId } }
    );

    // Delete review
    await Review.deleteOne({ _id: reviewId });

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};