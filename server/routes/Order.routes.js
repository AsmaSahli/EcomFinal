const express = require('express');

const orderController = require("../controllers/OrderController");
const router = express.Router();


router.post('/', orderController.createOrder);
router.get('/:orderId',orderController.getOrderById );
router.get('/user/:userId', orderController.getUserOrders);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;