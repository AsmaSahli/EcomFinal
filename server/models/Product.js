const mongoose = require("mongoose");

// Define the promotion reference schema first
const promotionReferenceSchema = new mongoose.Schema({
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }
}, { _id: false });

const categoryReferenceSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    group: { type: String, required: true },
    item: { type: String, required: true }
  }
}, { _id: false });
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
    enum: ['', '1 year', '2 years', '3 years', 'lifetime'],
    default: ''
  },
  promotions: [promotionReferenceSchema],
  activePromotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: [true, "Product reference is required"],
    unique: true,
    trim: true
  },
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
  categoryDetails: categoryReferenceSchema,
  sellers: [sellerSpecificSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", ProductSchema);