const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Delivery = require('../models/Delivery');
const { getShippingDaysByCity } = require('../utils/shipping');

const createOrder = async (req, res) => {
  try {
    const { userId, city } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let total = 0;
    const items = cart.items.map(item => {
      const price = item.productId.price;
      total += price * item.quantity;
      return {
        productId: item.productId._id,
        sellerId: item.sellerId,
        quantity: item.quantity,
        price
      };
    });

    const order = new Order({
      userId,
      items,
      totalAmount: total,
      shippingCity: city
    });

    await order.save();

    const uniqueSellers = [...new Set(items.map(i => i.sellerId.toString()))];

    for (let sellerId of uniqueSellers) {
      const sellerItem = items.find(i => i.sellerId.toString() === sellerId);
      const fromCity = sellerItem.productId.sellerCity;
      const toCity = city;
      const shippingTime = getShippingDaysByCity(fromCity, toCity);
      const handlingTime = 1;

      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + shippingTime + handlingTime);

      const delivery = new Delivery({
        orderId: order._id,
        fromCity,
        toCity,
        shippingTimeDays: shippingTime,
        estimatedDeliveryDate
      });

      await delivery.save();
    }

    await Cart.deleteOne({ userId });

    res.status(201).json({ message: 'Order created successfully', orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createOrder };
