const mongoose = require("mongoose");

const WarrantySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  durationInMonths: {
    type: Number,
    required: true,
    min: [1, "Warranty must be at least 1 month"]
  },
  conditions: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['replacement', 'repair', 'refund'],
    required: true
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Warranty", WarrantySchema);
