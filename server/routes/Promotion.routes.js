const express = require("express");
const router = express.Router();
const {
  createPromotion,
  getUserPromotions,
  getPromotionById,
} = require("../controllers/promotionController");

// Create promotion with image upload
router.post("/", createPromotion);

// Get all promotions for a specific user
router.get("/:userId", getUserPromotions);
router.get("/id/:promotionId", getPromotionById);

module.exports = router;
