const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

// Add item to wishlist
router.post("/add", wishlistController.addToWishlist);

// Get wishlist by user ID
router.get("/", wishlistController.getWishlistByUserId);

// Delete an item from wishlist
router.delete("/item", wishlistController.deleteWishlistItem);

// Delete entire wishlist
router.delete("/", wishlistController.deleteWishlist);

module.exports = router;
