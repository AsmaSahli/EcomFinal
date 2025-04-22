const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  discountRate: {
    type: Number,
    required: true,
    min: [0, "Discount must be positive"],
    max: [100, "Cannot exceed 100%"]
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Promotion", PromotionSchema);
