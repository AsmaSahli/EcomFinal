const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional, if you want to track a specific seller
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensure one wishlist per user
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);