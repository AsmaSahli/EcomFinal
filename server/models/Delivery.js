const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  estimatedDeliveryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['assigned', 'in_transit', 'delivered', 'failed'],
    default: 'assigned'
  },
  shippingDays: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', deliverySchema);
