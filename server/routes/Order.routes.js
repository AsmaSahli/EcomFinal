const express = require('express');
const orderController = require('../controllers/OrderController');
const router = express.Router();


router.get('/:orderId', orderController.getOrderById);
router.get('/seller/:sellerId/suborders', orderController.getSellerSuborders);
router.post('/', orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;