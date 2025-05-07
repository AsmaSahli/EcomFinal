const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add item to cart
router.post('/add', cartController.addToCart);

// Get cart by user ID
router.get('/', cartController.getCartByUserId);

// Delete an item from cart
router.delete('/item', cartController.deleteCartItem);

// Update quantity of an item in cart
router.put('/item/quantity', cartController.updateCartItemQuantity);

// Delete entire cart
router.delete('/', cartController.deleteCart);

module.exports = router;