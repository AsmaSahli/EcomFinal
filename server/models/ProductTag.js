const mongoose = require("mongoose");

const ProductTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tag name is required"],
    trim: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ProductTag", ProductTagSchema);
