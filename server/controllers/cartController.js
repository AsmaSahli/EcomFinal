const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, sellerId, quantity } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: 'Invalid product or seller ID' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    // Check if product and seller exist
    const product = await Product.findOne({ _id: productId, 'sellers.sellerId': sellerId });
    if (!product) {
      return res.status(404).json({ message: 'Product or seller not found' });
    }

    // Check stock
    const seller = product.sellers.find(s => s.sellerId.toString() === sellerId);
    if (seller.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${seller.stock}` });
    }

    // Update or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, sellerId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId && item.sellerId.toString() === sellerId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, sellerId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get cart by user ID
exports.getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'reference name description images categoryDetails',
        populate: {
          path: 'categoryDetails.category',
          select: 'name'
        }
      })
      .populate({
        path: 'items.sellerId',
        select: 'shopName'
      });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an item from cart
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    // Find and update cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update quantity of an item in cart
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find item
    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock for the product
    const product = await Product.findOne({ _id: item.productId, 'sellers.sellerId': item.sellerId });
    if (!product) {
      return res.status(404).json({ message: 'Product or seller not found' });
    }
    const seller = product.sellers.find(s => s.sellerId.toString() === item.sellerId.toString());
    if (seller.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${seller.stock}` });
    }

    // Update quantity
    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: 'Item quantity updated', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete entire cart
exports.deleteCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Delete cart
    const result = await Cart.deleteOne({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};