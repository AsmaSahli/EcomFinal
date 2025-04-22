const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, "Minimum rating is 1"],
    max: [5, "Maximum rating is 5"]
  },
  title: String,
  description: String,
  image: String,
  dateReview: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Review", ReviewSchema);
