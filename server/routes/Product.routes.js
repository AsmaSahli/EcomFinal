const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { upload, handleUploadErrors } = require("../utils/uploadsImages");

// Search route should come first
router.get("/search", productController.searchProducts);

// Then other specific routes
router.get("/reference/:reference", productController.getProductByReference);

// Then dynamic routes
router.get("/:id", productController.getProductById);

// Product creation
router.post("/", 
  upload.array('images', 10), 
  handleUploadErrors,
  productController.createProduct
);

// Update product
router.put("/:id", 
  upload.array('images', 10),
  handleUploadErrors,
  productController.updateProduct
);

// Seller management
router.post("/:id/sellers", productController.addSellerToProduct);
router.put("/:id/sellers/:sellerId", productController.updateSellerProduct);
router.delete("/:id/sellers/:sellerId", productController.removeSellerFromProduct);

// Image management
router.post("/:id/images",
  upload.array('images', 10),
  handleUploadErrors,
  productController.addProductImages
);

router.delete("/:id/images/:publicId", productController.deleteProductImage);
router.get('/seller/:id', productController.getProductsBySeller);

module.exports = router;