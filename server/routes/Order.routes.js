const express = require('express');
const orderController = require('../controllers/OrderController');
const router = express.Router();

// Define the split route before the generic orderId route
router.get('/split', orderController.splitOrderBySeller);
router.get('/:orderId', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;