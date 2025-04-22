const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }, { _id: true });
const ProductSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Product description is required"]
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"]
  },
  stock: {
    type: Number,
    required: [true, "Product stock is required"],
    min: [0, "Stock cannot be negative"]
  },
  images: [imageSchema],
  
  // 🔖 Tags
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductTag'
  }],

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Product seller ID is required"]
  },

  // 📂 Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },

  // ⭐ Reviews (Avis)
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],

  // ✅ Warranty (Garantie)
  warranty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warranty'
  },

  // 🎁 Promotion
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  }

}, {
  timestamps: true
});


// Generate product ID before saving
ProductSchema.pre('save', function(next) {
  if (!this.productId) {
    this.productId = 'PROD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

// Update stock method
ProductSchema.methods.updateStock = async function(newStock) {
  if (newStock < 0) {
    throw new Error('Stock cannot be negative');
  }
  this.stock = newStock;
  await this.save();
  return this;
};



module.exports = mongoose.model("Product", ProductSchema);