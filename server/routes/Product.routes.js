const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { upload, handleUploadErrors } = require("../utils/uploadsImages");

// Routes
router.post("/", 
  upload.array('images', 10), 
  handleUploadErrors,
  productController.createProduct
);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

router.put("/:id", 
  upload.array('images', 10),
  handleUploadErrors,
  productController.updateProduct
);

router.delete("/:id", productController.deleteProduct);

// Image upload route (for adding images to existing products)
router.post("/:id/images",
  upload.array('images', 10),
  handleUploadErrors,
  productController.addProductImages
);

// Image deletion route
router.delete("/:id/images/:publicId", 
  productController.deleteProductImage
);

module.exports = router;