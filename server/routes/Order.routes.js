const express = require("express");
const orderController = require("../controllers/OrderController");
const router = express.Router();

router.get("/:orderId", orderController.getOrderById);
router.get("/seller/:sellerId/suborders", orderController.getSellerSuborders);
router.get("/seller/:sellerId/stats", orderController.getSellerStats);
router.post("/", orderController.createOrder);
router.get("/user/:userId", orderController.getUserOrders);
router.put("/:orderId/status", orderController.updateOrderStatus);
router.delete("/:orderId", orderController.deleteOrder);
module.exports = router;
