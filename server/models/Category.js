const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subcategories: [{
    group: { type: String, required: true },
    items: [{ type: String, required: false, default: '' }]
  }]
});

module.exports = mongoose.model("Category", CategorySchema);
