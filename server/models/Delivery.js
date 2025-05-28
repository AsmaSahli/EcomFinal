const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    suborderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order.suborders',
        required: true,
        unique: true
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      deliveryPersonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      pickupAddress: {
        type: String, 
        required: true
      },
      dropoffAddress: {
        type: String, 
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }, { timestamps: true });
    
module.exports = mongoose.model('Delivery', deliverySchema);
