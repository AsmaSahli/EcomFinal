const express = require("express");
const router = express.Router();
const productTagController = require("../controllers/productTagController");

// Routes
router.post("/", productTagController.createProductTag);
router.get("/", productTagController.getAllProductTags);
router.get("/:id", productTagController.getProductTagById);
router.put("/:id", productTagController.updateProductTag);
router.delete("/:id", productTagController.deleteProductTag);

module.exports = router;
