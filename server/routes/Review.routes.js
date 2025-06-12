const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/ReviewsController");

// Routes
router.post("/", reviewController.addReview);
router.get(
  "/:productId/:sellerId",
  reviewController.getReviewsByProductAndSeller
);
router.put("/:reviewId", reviewController.updateReview);
router.delete("/:reviewId/:userId", reviewController.deleteReview);

module.exports = router;
