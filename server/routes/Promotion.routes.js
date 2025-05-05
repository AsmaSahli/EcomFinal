const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");

// Search promotions
router.get("/search", promotionController.searchPromotions);

// Get all promotions
router.get("/", promotionController.getAllPromotions);

// Promotion CRUD operations
router.post("/", promotionController.createPromotion);
router.get("/:id", promotionController.getPromotionById);
router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);

// Manage active promotions for a seller's product
router.put("/:productId/sellers/:sellerId/promotions/:promotionId/active", promotionController.setActivePromotion);
router.get("/:productId/sellers/:sellerId/promotions/active", promotionController.getActivePromotions);

module.exports = router;