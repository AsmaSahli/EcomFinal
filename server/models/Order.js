const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the base User model
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    default: null
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  apartment: String,
  city: {
    type: String,
    required: true
  },
  postalCode: String,
  governorate: {
    type: String,
    required: true
  },
  deliveryInstructions: String
}, { _id: false });

const shippingInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: addressSchema,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the base User model
    required: true
  },
  items: [orderItemSchema],
  shippingInfo: shippingInfoSchema,
  deliveryMethod: {
    type: String,
    enum: ['standard', 'express', 'pickup'],
    default: 'standard'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'credit'],
    default: 'cod'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now, 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

module.exports = mongoose.model('Order', orderSchema);