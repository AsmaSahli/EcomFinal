const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId, sellerId } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    if (sellerId && !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if seller exists (if provided)
    if (sellerId && !product.sellers.some(s => s.sellerId.toString() === sellerId)) {
      return res.status(404).json({ message: 'Seller not found for this product' });
    }

    // Update or create wishlist
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId, sellerId }] });
    } else {
      // Check for duplicate productId AND sellerId combination
      const isDuplicate = wishlist.items.some(
        item =>
          item.productId.toString() === productId &&
          (item.sellerId?.toString() === sellerId || (!item.sellerId && !sellerId))
      );
      if (isDuplicate) {
        return res.status(400).json({ message: 'This product from this seller is already in your wishlist' });
      }
      wishlist.items.push({ productId, sellerId });
    }

    await wishlist.save();
    res.status(200).json({ message: 'Item added to wishlist', wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get wishlist by user ID
exports.getWishlistByUserId = async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const wishlist = await Wishlist.findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'reference name description images categoryDetails sellers',
        populate: [
          {
            path: 'categoryDetails.category',
            select: 'name'
          },
          {
            path: 'sellers.sellerId',
            select: 'shopName'
          }
        ]
      })
      .populate({
        path: 'items.sellerId',
        select: 'shopName'
      });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Filter out items with null productId (e.g., deleted products)
    wishlist.items = wishlist.items.filter(item => item.productId != null);
    await wishlist.save();

    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an item from wishlist
exports.deleteWishlistItem = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    // Find and update wishlist
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const itemIndex = wishlist.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    // Remove the item
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.status(200).json({ message: 'Item removed from wishlist', wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete entire wishlist
exports.deleteWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Delete wishlist
    const result = await Wishlist.deleteOne({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.status(200).json({ message: 'Wishlist deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};