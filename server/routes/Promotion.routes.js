const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");

// Promotion CRUD operations
router.post("/", promotionController.createPromotion);
router.get("/", promotionController.getAllPromotions);
router.get("/product/:productId", promotionController.getProductPromotions);
router.get("/:id", promotionController.getPromotionById);
router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);

// Promotion product management
router.post("/:id/products", promotionController.addProductsToPromotion);
router.delete("/:id/products", promotionController.removeProductsFromPromotion);

// Promotion activation
router.post("/activate", promotionController.activatePromotion);
router.post("/deactivate", promotionController.deactivatePromotion);

// Product-specific promotion routes
router.get("/product/:productId/seller/:sellerId", promotionController.getProductPromotions);

module.exports = router;