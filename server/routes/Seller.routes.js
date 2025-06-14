const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/SellerController");
const upload = require("../utils/upload");

// Seller registration route
router.post(
  "/register",
  upload.fields([
    { name: "fiscalIdentificationCard", maxCount: 1 },
    { name: "tradeRegister", maxCount: 1 },
  ]),
  sellerController.registerSeller
);
router.get("/getSellerDetails", sellerController.getSellerDetails);
router.get("/pending-count", sellerController.getPendingSellersCount);

module.exports = (app) => {
  app.use("/api/seller", router);
};
