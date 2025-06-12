const express = require("express");
const router = express.Router();
const { createPaymentIntent } = require("../controllers/paymentController");

// Create Payment Intent
router.post("/create-payment-intent", createPaymentIntent);

module.exports = router;
