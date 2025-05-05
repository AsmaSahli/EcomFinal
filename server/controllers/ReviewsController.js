const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, sellerId, rating, comment } = req.body;
    const userId = req.user._id; // Assuming user ID from auth middleware

    // Validate required fields
    if (!productId || !sellerId || !rating) {
      return res.status(400).json({ error: 'Product ID, seller ID, and rating are required' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if product exists and has the seller
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const sellerIndex = product.sellers.findIndex(s => s.sellerId.toString() === sellerId);
    if (sellerIndex === -1) {
      return res.status(404).json({ message: 'Seller not found for this product' });
    }

    // Check if user already reviewed this product-seller pair
    const existingReview = await Review.findOne({ product: productId, seller: sellerId, user: userId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this seller for this product' });
    }

    const reviewData = {
      product: productId,
      seller: sellerId,
      user: userId,
      rating,
      comment
    };

    const review = await Review.create(reviewData);

    // Add review to the seller's reviews array in the product
    product.sellers[sellerIndex].reviews.push(review._id);
    await product.save();

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('seller', 'name email')
      .populate('product', 'reference name');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.errors });
  }
};

// Get all reviews for a product and seller
exports.getReviewsByProductAndSeller = async (req, res) => {
  try {
    const { productId, sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!product.sellers.some(s => s.sellerId.toString() === sellerId)) {
      return res.status(404).json({ message: 'Seller not found for this product' });
    }

    const reviews = await Review.find({ product: productId, seller: sellerId })
      .populate('user', 'name email')
      .populate('seller', 'name email')
      .populate('product', 'reference name')
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('seller', 'name email')
      .populate('product', 'reference name');

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.errors });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Remove review from the seller's reviews array in the product
    await Product.updateOne(
      { _id: review.product, 'sellers.sellerId': review.seller },
      { $pull: { 'sellers.$.reviews': reviewId } }
    );

    await review.remove();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};