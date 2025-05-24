const express = require('express');
const { createOrder } = require('../controllers/OrderController');

const router = express.Router();

router.post('/create', createOrder);

module.exports = router;
