const mongoose = require("mongoose");

const sellerSpecificSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"]
  },
  stock: {
    type: Number,
    required: true,
    min: [0, "Stock cannot be negative"]
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductTag'
  }],
  warranty: {
    type: String,
    enum: ['', '1 year', '2 years', '3 years', 'lifetime'], // Example warranty options
    default: ''
  },
  // Add any other seller-specific fields here
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  // Unique product reference (like SKU or ISBN)
  reference: {
    type: String,
    required: [true, "Product reference is required"],
    unique: true,
    trim: true
  },
  
  // Common product information
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Product description is required"]
  },
  images: [imageSchema],
  
  // Category information (common to all sellers)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  
  // // Reviews (common to all sellers)
  // reviews: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Review'
  // }],
  
  // Seller-specific information
  sellers: [sellerSpecificSchema],
  
  // Original seller who created the product
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", ProductSchema);